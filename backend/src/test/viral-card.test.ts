/**
 * Viral Card Feature Tests
 * 
 * Manual Test Steps + Automated Unit Tests
 * Tests viral_card functionality across all modes and tiers
 */

// ============================================
// MANUAL TEST STEPS
// ============================================

/*
## TEST 1: Snapshot Mode includes viral_card

1. Login with any tier (Free/Pro/Plus/Max)
2. Go to Dashboard
3. Enter a message: "Hey, had a great time last night 😊"
4. Run Snapshot analysis
5. VERIFY: Response includes viral_card object
6. VERIFY: Click "Share" tab - ShareableScorecard renders
7. VERIFY: Download Story button works (1080x1920)
8. VERIFY: Download Square button works (1080x1080)
9. VERIFY: Copy Caption copies correct format

Expected viral_card structure:
{
  "headline": "...", // max 28 chars
  "stamp": "GREEN SIGNAL" | "MIXED SIGNAL" | "RED FLAG",
  "shareable_quote": "...", // max 80 chars
  "score_visual": 0-100, // equals interest_level
  "roast_level": "mild" | "spicy"
}


## TEST 2: Expanded Mode includes viral_card

1. Login with Pro/Plus/Max tier
2. Run Expanded analysis on: "I don't know if I can make it this weekend"
3. VERIFY: Response includes viral_card
4. VERIFY: Share tab appears
5. VERIFY: stamp is computed correctly based on interest_level and emotional_risk


## TEST 3: Deep Mode includes viral_card

1. Login with Max tier (or Plus with credits)
2. Run Deep analysis on a longer conversation
3. VERIFY: Response includes viral_card
4. VERIFY: Share tab appears
5. VERIFY: All fields populated correctly


## TEST 4: Stamp Computation Rules

Test cases for deterministic stamp logic:

| interest_level | emotional_risk | expected_stamp  |
|----------------|----------------|-----------------|
| 80             | low            | GREEN SIGNAL    |
| 80             | high           | RED FLAG        |
| 75             | medium         | GREEN SIGNAL    |
| 74             | low            | MIXED SIGNAL    |
| 50             | medium         | MIXED SIGNAL    |
| 45             | low            | MIXED SIGNAL    |
| 44             | low            | RED FLAG        |
| 20             | low            | RED FLAG        |


## TEST 5: Score Visual equals Interest Level

1. Run any analysis
2. VERIFY: viral_card.score_visual === parsed interest_level (0-100)


## TEST 6: Roast Level Rules

| tier | emotional_risk | tone      | expected_roast |
|------|----------------|-----------|----------------|
| free | low            | flirty    | mild           |
| pro  | low            | flirty    | spicy          |
| plus | high           | flirty    | mild           |
| max  | low            | neutral   | mild           |
| max  | low            | playful   | spicy          |


## TEST 7: No Extra AI Calls

1. Open browser Network tab
2. Run analysis
3. VERIFY: Only ONE /api/analysis POST request
4. VERIFY: No additional AI calls for viral_card


## TEST 8: Export Works on Mobile

1. Open app on mobile device or Chrome DevTools mobile view
2. Run analysis
3. Go to Share tab
4. VERIFY: Card renders properly in mobile viewport
5. VERIFY: Download buttons work on mobile
6. VERIFY: Downloaded images are correct aspect ratios


## TEST 9: No Business Logic Changes

1. Verify credit deduction is unchanged
2. Verify tier-based mode access unchanged
3. Verify model routing unchanged
4. Verify token caps are within acceptable range (minimal increase)
*/


// ============================================
// AUTOMATED UNIT TESTS
// ============================================

interface ViralCard {
  headline: string;
  stamp: 'GREEN SIGNAL' | 'MIXED SIGNAL' | 'RED FLAG';
  shareable_quote: string;
  score_visual: number;
  roast_level: 'mild' | 'spicy';
}

/**
 * Replicate the backend computeViralCard logic for testing
 */
function computeViralCard(
  content: any,
  subscriptionTier: string,
): ViralCard {
  const interestLevelStr = content.interest_level || '50%';
  const interestLevel = parseInt(interestLevelStr.replace('%', ''), 10) || 50;
  const emotionalRisk = (content.emotional_risk || 'medium') as 'low' | 'medium' | 'high';
  
  // Compute stamp deterministically
  let stamp: 'GREEN SIGNAL' | 'MIXED SIGNAL' | 'RED FLAG';
  if (interestLevel >= 75 && emotionalRisk !== 'high') {
    stamp = 'GREEN SIGNAL';
  } else if (interestLevel >= 45 && interestLevel <= 74) {
    stamp = 'MIXED SIGNAL';
  } else {
    stamp = 'RED FLAG';
  }
  
  const scoreVisual = interestLevel;
  
  // Roast level logic
  let roastLevel: 'mild' | 'spicy' = 'mild';
  if (subscriptionTier !== 'free' && emotionalRisk !== 'high') {
    const tone = (content.tone || '').toLowerCase();
    const flirtyTones = ['flirty', 'teasing', 'playful', 'suggestive', 'cheeky', 'bold'];
    if (flirtyTones.some(t => tone.includes(t))) {
      roastLevel = 'spicy';
    }
  }
  
  let headline = content.viral_card?.headline || content.intent?.substring(0, 28) || 'Message Decoded';
  headline = headline.substring(0, 28);
  
  let shareableQuote = content.viral_card?.shareable_quote || `Interest at ${interestLevel}% - ${stamp.toLowerCase()}`;
  shareableQuote = shareableQuote.substring(0, 80);
  
  return { headline, stamp, shareable_quote: shareableQuote, score_visual: scoreVisual, roast_level: roastLevel };
}

// Test cases
const testCases = [
  // Stamp tests
  { name: 'HIGH interest + LOW risk = GREEN', input: { interest_level: '80%', emotional_risk: 'low' }, tier: 'free', expected: { stamp: 'GREEN SIGNAL' } },
  { name: 'HIGH interest + HIGH risk = RED', input: { interest_level: '80%', emotional_risk: 'high' }, tier: 'free', expected: { stamp: 'RED FLAG' } },
  { name: 'BOUNDARY 75 + MEDIUM risk = GREEN', input: { interest_level: '75%', emotional_risk: 'medium' }, tier: 'free', expected: { stamp: 'GREEN SIGNAL' } },
  { name: 'BOUNDARY 74 = MIXED', input: { interest_level: '74%', emotional_risk: 'low' }, tier: 'free', expected: { stamp: 'MIXED SIGNAL' } },
  { name: 'MID 50 = MIXED', input: { interest_level: '50%', emotional_risk: 'medium' }, tier: 'free', expected: { stamp: 'MIXED SIGNAL' } },
  { name: 'BOUNDARY 45 = MIXED', input: { interest_level: '45%', emotional_risk: 'low' }, tier: 'free', expected: { stamp: 'MIXED SIGNAL' } },
  { name: 'BOUNDARY 44 = RED', input: { interest_level: '44%', emotional_risk: 'low' }, tier: 'free', expected: { stamp: 'RED FLAG' } },
  { name: 'LOW 20 = RED', input: { interest_level: '20%', emotional_risk: 'low' }, tier: 'free', expected: { stamp: 'RED FLAG' } },
  
  // Score visual tests
  { name: 'score_visual = interest_level 80', input: { interest_level: '80%' }, tier: 'free', expected: { score_visual: 80 } },
  { name: 'score_visual = interest_level 50', input: { interest_level: '50%' }, tier: 'free', expected: { score_visual: 50 } },
  
  // Roast level tests
  { name: 'FREE tier always mild', input: { interest_level: '80%', emotional_risk: 'low', tone: 'flirty' }, tier: 'free', expected: { roast_level: 'mild' } },
  { name: 'PRO + flirty + low risk = spicy', input: { interest_level: '80%', emotional_risk: 'low', tone: 'flirty' }, tier: 'pro', expected: { roast_level: 'spicy' } },
  { name: 'PRO + flirty + HIGH risk = mild', input: { interest_level: '80%', emotional_risk: 'high', tone: 'flirty' }, tier: 'pro', expected: { roast_level: 'mild' } },
  { name: 'MAX + neutral tone = mild', input: { interest_level: '80%', emotional_risk: 'low', tone: 'neutral' }, tier: 'max', expected: { roast_level: 'mild' } },
  { name: 'MAX + playful tone = spicy', input: { interest_level: '80%', emotional_risk: 'low', tone: 'playful' }, tier: 'max', expected: { roast_level: 'spicy' } },
  { name: 'PLUS + teasing tone = spicy', input: { interest_level: '80%', emotional_risk: 'low', tone: 'teasing' }, tier: 'plus', expected: { roast_level: 'spicy' } },
];

function runTests() {
  console.log('🧪 Running Viral Card Unit Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const tc of testCases) {
    const result = computeViralCard(tc.input, tc.tier);
    
    let testPassed = true;
    const failures: string[] = [];
    
    for (const [key, expectedValue] of Object.entries(tc.expected)) {
      const actualValue = (result as any)[key];
      if (actualValue !== expectedValue) {
        testPassed = false;
        failures.push(`${key}: expected "${expectedValue}", got "${actualValue}"`);
      }
    }
    
    if (testPassed) {
      console.log(`✅ PASS: ${tc.name}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${tc.name}`);
      failures.forEach(f => console.log(`   ${f}`));
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Run if executed directly
runTests();

export { computeViralCard, runTests, testCases };
