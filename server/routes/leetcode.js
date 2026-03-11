const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fetch LeetCode problems via public GraphQL (no auth). We'll paginate up to a sensible cap.
async function fetchLeetCodeProblems(maxCount = 1000) {
  const problems = [];
  let skip = 0;
  const pageSize = 100;
  let hasMore = true;

  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: problemsetQuestionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        hasMore
        total
        questions: questions {
          title
          titleSlug
          difficulty
          acRate
          isPaidOnly
          topicTags { name slug }
        }
      }
    }
  `;

  while (hasMore && problems.length < maxCount) {
    const variables = {
      categorySlug: "all",
      skip,
      limit: Math.min(pageSize, maxCount - problems.length),
      filters: {}
    };

    const resp = await axios.post('https://leetcode.com/graphql', { query, variables }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/problemset/',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 20000
    });

    const data = resp.data?.data?.problemsetQuestionList;
    if (!data) break;
    const batch = data.questions || [];
    for (const q of batch) {
      problems.push({
        id: q.titleSlug,
        title: q.title,
        slug: q.titleSlug,
        url: `https://leetcode.com/problems/${q.titleSlug}/`,
        difficulty: q.difficulty,
        acRate: q.acRate,
        paidOnly: !!q.isPaidOnly,
        tags: (q.topicTags || []).map(t => t.name)
      });
    }
    hasMore = !!data.hasMore && batch.length > 0;
    skip += batch.length;
  }

  return problems;
}

router.get('/problems', async (req, res) => {
  try {
    const max = Math.min(parseInt(req.query.max || '1000', 10), 3000);
    let list = [];

    // Try GraphQL first to include topic tags (for category filters)
    try {
      list = await fetchLeetCodeProblems(max);
    } catch (graphErr) {
      // Fallback to legacy endpoint (no tags/companies info)
      try {
        const resp = await axios.get('https://leetcode.com/api/problems/all/', {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://leetcode.com/problemset/all/',
            'Accept': 'application/json',
            'Origin': 'https://leetcode.com'
          },
          timeout: 20000
        });
        const pairs = resp.data?.stat_status_pairs || [];
        list = pairs.slice(0, max).map((p) => ({
          id: p.stat?.question__title_slug,
          title: p.stat?.question__title,
          slug: p.stat?.question__title_slug,
          url: `https://leetcode.com/problems/${p.stat?.question__title_slug}/`,
          difficulty: (p.difficulty?.level === 1 ? 'Easy' : p.difficulty?.level === 2 ? 'Medium' : 'Hard'),
          acRate: undefined,
          paidOnly: !!p.paid_only,
          tags: [],
          companies: []
        }));
      } catch (legacyErr) {
        throw legacyErr;
      }
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (e) {
    console.error('LeetCode fetch error:', e.message);
    res.status(500).json({ success: false, error: 'Failed to fetch LeetCode problems' });
  }
});

module.exports = router;


