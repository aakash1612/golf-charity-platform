const User = require('../models/User');
const Score = require('../models/Score');
const Draw = require('../models/Draw');

// Configuration
const POOL_CONTRIBUTION_MONTHLY = parseFloat(process.env.POOL_CONTRIBUTION_MONTHLY || '5'); // £5 per monthly sub
const POOL_CONTRIBUTION_YEARLY = parseFloat(process.env.POOL_CONTRIBUTION_YEARLY || '50'); // £50 per yearly sub

// Calculate prize pool from active subscribers
async function calculatePrizePool(carryOver = 0) {
  const subscribers = await User.find({ 'subscription.status': 'active' });
  const subscriberCount = subscribers.length;

  let total = carryOver;
  subscribers.forEach((u) => {
    if (u.subscription.plan === 'yearly') {
      total += POOL_CONTRIBUTION_YEARLY / 12; // monthly equivalent
    } else {
      total += POOL_CONTRIBUTION_MONTHLY;
    }
  });

  return {
    total: parseFloat(total.toFixed(2)),
    fiveMatch: parseFloat((total * 0.4).toFixed(2)),   // 40% jackpot
    fourMatch: parseFloat((total * 0.35).toFixed(2)),  // 35%
    threeMatch: parseFloat((total * 0.25).toFixed(2)), // 25%
    subscriberCount,
    poolContributionPerSub: POOL_CONTRIBUTION_MONTHLY,
  };
}

// Generate random draw numbers (5 unique from 1-45)
function generateRandomNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Generate algorithmic draw based on user score frequency
async function generateAlgorithmicNumbers() {
  const allScores = await Score.find({});
  const frequency = {};

  // Count frequency of each score value (1-45)
  allScores.forEach((doc) => {
    doc.scores.forEach((s) => {
      frequency[s.value] = (frequency[s.value] || 0) + 1;
    });
  });

  // Build weighted pool: less frequent = higher weight (more likely to be drawn)
  const weightedPool = [];
  for (let i = 1; i <= 45; i++) {
    const freq = frequency[i] || 0;
    const weight = Math.max(1, 10 - freq); // inverse frequency weighting
    for (let w = 0; w < weight; w++) {
      weightedPool.push(i);
    }
  }

  // Pick 5 unique numbers from weighted pool
  const picked = new Set();
  while (picked.size < 5) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    picked.add(weightedPool[idx]);
  }

  return Array.from(picked).sort((a, b) => a - b);
}

// Check how many of a user's scores match drawn numbers
function checkMatch(userScores, drawnNumbers) {
  const drawnSet = new Set(drawnNumbers);
  const userValues = userScores.map((s) => s.value);
  const matches = userValues.filter((v) => drawnSet.has(v));

  if (matches.length >= 5) return { type: '5-match', matched: matches };
  if (matches.length === 4) return { type: '4-match', matched: matches };
  if (matches.length === 3) return { type: '3-match', matched: matches };
  return null;
}

// Run a draw (or simulation)
async function runDraw({ month, year, drawType = 'random', simulate = false }) {
  // Get or create draw document
  let draw = await Draw.findOne({ month, year });
  if (!draw) {
    draw = new Draw({ month, year, drawType });
  }

  // Generate numbers
  const drawnNumbers =
    drawType === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers();

  // Get previous month's jackpot carry-over
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear });
  const carryOver = prevDraw && !prevDraw.winners.some((w) => w.matchType === '5-match')
    ? prevDraw.prizePool.fiveMatch
    : 0;

  // Calculate prize pool
  const pool = await calculatePrizePool(carryOver);

  draw.drawnNumbers = drawnNumbers;
  draw.drawType = drawType;
  draw.jackpotCarryOver = carryOver;
  draw.prizePool = pool;
  draw.subscriberCount = pool.subscriberCount;
  draw.poolContributionPerSub = pool.poolContributionPerSub;

  // Find winners
  const allScores = await Score.find({}).populate('user');
  const winnersByType = { '5-match': [], '4-match': [], '3-match': [] };

  allScores.forEach((scoreDoc) => {
    if (!scoreDoc.user || scoreDoc.user.subscription?.status !== 'active') return;
    if (scoreDoc.scores.length < 3) return; // need at least 3 scores to match

    const result = checkMatch(scoreDoc.scores, drawnNumbers);
    if (result) {
      winnersByType[result.type].push({
        user: scoreDoc.user._id,
        matchType: result.type,
        matchedNumbers: result.matched,
        paymentStatus: 'pending',
      });
    }
  });

  // Calculate prize per winner per tier
  const calcPrize = (poolAmount, winners) =>
    winners.length > 0 ? parseFloat((poolAmount / winners.length).toFixed(2)) : 0;

  const winners = [
    ...winnersByType['5-match'].map((w) => ({
      ...w,
      prizeAmount: calcPrize(pool.fiveMatch, winnersByType['5-match']),
    })),
    ...winnersByType['4-match'].map((w) => ({
      ...w,
      prizeAmount: calcPrize(pool.fourMatch, winnersByType['4-match']),
    })),
    ...winnersByType['3-match'].map((w) => ({
      ...w,
      prizeAmount: calcPrize(pool.threeMatch, winnersByType['3-match']),
    })),
  ];

  draw.winners = winners;

  if (simulate) {
    draw.status = 'simulated';
    draw.simulatedAt = new Date();
  } else {
    draw.status = 'published';
    draw.publishedAt = new Date();

    // Update total won for each winner user
    for (const w of winners) {
      await User.findByIdAndUpdate(w.user, { $inc: { totalWon: w.prizeAmount } });
    }

    // Update charity contributions
    await updateCharityContributions();
  }

  await draw.save();
  return draw;
}

// Calculate and distribute charity contributions
async function updateCharityContributions() {
  const users = await User.find({ 'subscription.status': 'active' }).populate('selectedCharity');
  const charityTotals = {};

  users.forEach((u) => {
    if (!u.selectedCharity) return;
    const charityId = u.selectedCharity._id.toString();
    const planAmount = u.subscription.plan === 'yearly'
      ? parseFloat(process.env.YEARLY_PRICE || '99.99') / 12
      : parseFloat(process.env.MONTHLY_PRICE || '9.99');
    const contribution = (planAmount * u.charityContributionPercent) / 100;
    charityTotals[charityId] = (charityTotals[charityId] || 0) + contribution;
  });

  const Charity = require('../models/Charity');
  for (const [id, amount] of Object.entries(charityTotals)) {
    await Charity.findByIdAndUpdate(id, { $inc: { totalReceived: parseFloat(amount.toFixed(2)) } });
  }
}

module.exports = { runDraw, calculatePrizePool, generateRandomNumbers, generateAlgorithmicNumbers };