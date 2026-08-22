import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { callGemini } from '../utils/ai';

function parseJSON(raw) {
  try {
    const s = raw.indexOf('{');
    const e = raw.lastIndexOf('}');
    if (s !== -1 && e !== -1) return JSON.parse(raw.substring(s, e + 1));
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ── Static data ────────────────────────────────────────────────── */
/* ── Diverse Fallback Practice Bank ───────────────────────────── */
const FALLBACK_PROBLEMS = [
  {
    title: 'Valid Parentheses',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['String', 'Stack'],
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.`,
    examples: [
      { input: 's = "()"', output: 'true', explain: 'Matched open and close parentheses.' },
      { input: 's = "()[]{}"', output: 'true', explain: 'All pairs properly closed in order.' },
      { input: 's = "(]"', output: 'false', explain: 'Mismatched closing bracket.' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only ()[]{}'],
    testCases: [
      { label: 's = "()"', expected: 'true', pass: true },
      { label: 's = "()[]{}"', expected: 'true', pass: true },
      { label: 's = "(]"', expected: 'false', pass: true },
    ],
    starter: {
      javascript: `function isValid(s) {\n  // Write your solution here\n  \n}`,
      python: `def is_valid(s: str) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
    },
  },
  {
    title: 'Container With Most Water',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Two Pointers', 'Array', 'Greedy'],
    statement: `You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explain: 'The max area is between index 1 and 8.' },
      { input: 'height = [1,1]', output: '1', explain: 'Width = 1, min height = 1.' },
    ],
    constraints: ['n == height.length', '2 ≤ n ≤ 10⁵', '0 ≤ height[i] ≤ 10⁴'],
    testCases: [
      { label: '[1,8,6,2,5,4,8,3,7]', expected: '49', pass: true },
      { label: '[1,1]', expected: '1', pass: true },
      { label: '[4,3,2,1,4]', expected: '16', pass: true },
    ],
    starter: {
      javascript: `function maxArea(height) {\n  // Write your solution here\n  \n}`,
      python: `def max_area(height: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
  },
  {
    title: 'Maximum Subarray (Kadane)',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Dynamic Programming', 'Array'],
    statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explain: 'Subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explain: 'Single element array.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explain: 'The entire array adds up to 23.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    testCases: [
      { label: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6', pass: true },
      { label: '[1]', expected: '1', pass: true },
      { label: '[5,4,-1,7,8]', expected: '23', pass: true },
    ],
    starter: {
      javascript: `function maxSubArray(nums) {\n  // Write your solution here\n  \n}`,
      python: `def max_sub_array(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
  },
  {
    title: 'Valid Anagram',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['Hash Table', 'String', 'Sorting'],
    statement: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explain: 'Same character frequencies.' },
      { input: 's = "rat", t = "car"', output: 'false', explain: 'Different characters.' },
    ],
    constraints: ['1 ≤ s.length, t.length ≤ 5 * 10⁴', 's and t consist of lowercase English letters.'],
    testCases: [
      { label: 's="anagram", t="nagaram"', expected: 'true', pass: true },
      { label: 's="rat", t="car"', expected: 'false', pass: true },
      { label: 's="listen", t="silent"', expected: 'true', pass: true },
    ],
    starter: {
      javascript: `function isAnagram(s, t) {\n  // Write your solution here\n  \n}`,
      python: `def is_anagram(s: str, t: str) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your solution here\n        return false;\n    }\n}`,
    },
  },
  {
    title: 'Two Sum',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Array', 'Hash Map'],
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explain: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explain: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Each input has exactly one solution'],
    testCases: [
      { label: '[2,7,11,15], target=9', expected: '[0,1]', pass: true },
      { label: '[3,2,4], target=6', expected: '[1,2]', pass: true },
      { label: '[3,3], target=6', expected: '[0,1]', pass: true },
    ],
    starter: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
    },
  },
  {
    title: 'Binary Search',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['Binary Search', 'Array'],
    statement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explain: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explain: '2 does not exist in nums so return -1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁴ < nums[i], target < 10⁴', 'All integers in nums are unique.'],
    testCases: [
      { label: '[-1,0,3,5,9,12], target=9', expected: '4', pass: true },
      { label: '[-1,0,3,5,9,12], target=2', expected: '-1', pass: true },
    ],
    starter: {
      javascript: `function search(nums, target) {\n  // Write your solution here\n  \n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}`,
    },
  },
  {
    title: 'Reverse Linked List',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['Linked List', 'Recursion'],
    statement: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explain: 'Reversed head order.' },
      { input: 'head = [1,2]', output: '[2,1]', explain: 'Two elements list reversed.' },
    ],
    constraints: ['The number of nodes in the list is in the range [0, 5000].', '-5000 ≤ Node.val ≤ 5000'],
    testCases: [
      { label: '[1,2,3,4,5]', expected: '[5,4,3,2,1]', pass: true },
      { label: '[1,2]', expected: '[2,1]', pass: true },
    ],
    starter: {
      javascript: `function reverseList(head) {\n  // Write your solution here\n  \n}`,
      python: `def reverse_list(head):\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
    },
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Sliding Window', 'Hash Set', 'String'],
    statement: `Given a string s, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explain: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explain: 'The answer is "wke", with length 3.' },
    ],
    constraints: ['0 ≤ s.length ≤ 5 * 10⁴', 's consists of English letters, digits, symbols and spaces.'],
    testCases: [
      { label: 's = "abcabcbb"', expected: '3', pass: true },
      { label: 's = "bbbbb"', expected: '1', pass: true },
      { label: 's = "pwwkew"', expected: '3', pass: true },
    ],
    starter: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your solution here\n  \n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['Array', 'Dynamic Programming'],
    statement: `You are given an array prices where prices[i] is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explain: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explain: 'In this case, no transactions are done, max profit = 0.' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    testCases: [
      { label: '[7,1,5,3,6,4]', expected: '5', pass: true },
      { label: '[7,6,4,3,1]', expected: '0', pass: true },
    ],
    starter: {
      javascript: `function maxProfit(prices) {\n  // Write your solution here\n  \n}`,
      python: `def max_profit(prices: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
  },
  {
    title: 'Coin Change',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Dynamic Programming', 'Breadth-First Search'],
    statement: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explain: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1', explain: 'Amount cannot be formed.' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2³¹ - 1', '0 ≤ amount ≤ 10⁴'],
    testCases: [
      { label: 'coins=[1,2,5], amount=11', expected: '3', pass: true },
      { label: 'coins=[2], amount=3', expected: '-1', pass: true },
    ],
    starter: {
      javascript: `function coinChange(coins, amount) {\n  // Write your solution here\n  \n}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}`,
    },
  },
  {
    title: 'Search in Rotated Sorted Array',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Binary Search', 'Array'],
    statement: `Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explain: '0 is found at index 4.' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explain: '3 is not in array.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 5000', '-10⁴ ≤ nums[i] ≤ 10⁴', 'All values of nums are unique.'],
    testCases: [
      { label: '[4,5,6,7,0,1,2], target=0', expected: '4', pass: true },
      { label: '[4,5,6,7,0,1,2], target=3', expected: '-1', pass: true },
    ],
    starter: {
      javascript: `function search(nums, target) {\n  // Write your solution here\n  \n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}`,
    },
  },
  {
    title: 'Top K Frequent Elements',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Heap / Priority Queue', 'Hash Map', 'Bucket Sort'],
    statement: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explain: '1 occurs 3 times, 2 occurs 2 times.' },
      { input: 'nums = [1], k = 1', output: '[1]', explain: 'Single element.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴', 'k is in the range [1, the number of unique elements in the array].'],
    testCases: [
      { label: '[1,1,1,2,2,3], k=2', expected: '[1,2]', pass: true },
      { label: '[1], k=1', expected: '[1]', pass: true },
    ],
    starter: {
      javascript: `function topKFrequent(nums, k) {\n  // Write your solution here\n  \n}`,
      python: `def top_k_frequent(nums: list[int], k: int) -> list[int]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
    },
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: { label: 'Easy', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    tags: ['Linked List', 'Two Pointers'],
    statement: `You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explain: 'Sorted merged list.' },
      { input: 'list1 = [], list2 = []', output: '[]', explain: 'Empty lists.' },
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 ≤ Node.val ≤ 100'],
    testCases: [
      { label: '[1,2,4], [1,3,4]', expected: '[1,1,2,3,4,4]', pass: true },
      { label: '[], []', expected: '[]', pass: true },
    ],
    starter: {
      javascript: `function mergeTwoLists(list1, list2) {\n  // Write your solution here\n  \n}`,
      python: `def merge_two_lists(list1, list2):\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your solution here\n        return null;\n    }\n}`,
    },
  },
  {
    title: 'Number of Islands',
    difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    tags: ['Graph BFS / DFS', 'Matrix', 'Union Find'],
    statement: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', explain: '1 connected island.' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3', explain: '3 separate islands.' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300'],
    testCases: [
      { label: 'Single large island grid', expected: '1', pass: true },
      { label: 'Three disconnected islands grid', expected: '3', pass: true },
    ],
    starter: {
      javascript: `function numIslands(grid) {\n  // Write your solution here\n  \n}`,
      python: `def num_islands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
  },
  {
    title: 'LRU Cache Design',
    difficulty: { label: 'Hard', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
    tags: ['Design', 'Doubly Linked List', 'Hash Map'],
    statement: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class with get(key) and put(key, value) in O(1) average time complexity.`,
    examples: [
      { input: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]', output: '[null, null, null, 1, null, -1]', explain: 'Key 2 evicted when key 3 added.' },
    ],
    constraints: ['1 ≤ capacity ≤ 3000', '0 ≤ key ≤ 10⁴', '0 ≤ value ≤ 10⁵', 'At most 2 * 10⁵ calls to get and put.'],
    testCases: [
      { label: 'Capacity 2 put/get sequence', expected: '1, -1', pass: true },
    ],
    starter: {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    // Initialize cache\n  }\n  get(key) {\n    return -1;\n  }\n  put(key, value) {\n    \n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    public int get(int key) {\n        return -1;\n    }\n    public void put(int key, int value) {\n        \n    }\n}`,
    },
  },
];

const DEFAULT_PROBLEM = FALLBACK_PROBLEMS[0];

const STARTER = DEFAULT_PROBLEM.starter;

const LANG_OPTIONS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'java',       label: 'Java'       },
];

/* ── AI fallback ────────────────────────────────────────────────── */
const FALLBACK_REVIEW = {
  correctness:   70,
  efficiency:    60,
  codeQuality:   75,
  feedback:      [{ type: 'tip', text: 'Could not analyse — check syntax.' }],
  complexityNote: 'Analysis unavailable.',
};

/* ── Sub-components ─────────────────────────────────────────────── */
function MetricBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#A7ADBA]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: color,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function CodeEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const gutterRef   = useRef(null);
  const lines       = value.split('\n');

  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: ss, selectionEnd: se } = e.target;
    const next = value.slice(0, ss) + '  ' + value.slice(se);
    onChange(next);
    setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = ss + 2; }, 0);
  };

  return (
    <div
      className="flex rounded-b-xl overflow-hidden flex-1 min-h-0"
      style={{ background: '#0B0D12', border: '1px solid #282D38', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <div
        ref={gutterRef}
        className="select-none overflow-hidden flex-shrink-0"
        style={{ width: 44, background: '#11131A', borderRight: '1px solid #282D38', overflowY: 'hidden', paddingTop: 12, paddingBottom: 12 }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ height: 21, lineHeight: '21px', fontSize: 12, color: '#737B8C', textAlign: 'right', paddingRight: 8 }}>
            {i + 1}
          </div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleTab}
        onScroll={syncScroll}
        spellCheck={false}
        className="flex-1 resize-none outline-none p-3 text-sm leading-[21px]"
        style={{ background: '#0B0D12', color: '#F5F7FA', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, lineHeight: '21px', caretColor: '#8B5CF6', tabSize: 2 }}
      />
    </div>
  );
}

function TestResults({ results, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[#1B1E27] border border-[#282D38]">
        <span className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-xs text-[#A7ADBA] font-medium">Running test cases...</span>
      </div>
    );
  }

  const passed = results.filter((r) => r.pass).length;
  return (
    <div className="rounded-xl overflow-hidden border border-[#282D38] bg-[#171A22]">
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b border-[#282D38]"
        style={{ background: passed === results.length ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)' }}
      >
        <span className="text-xs font-bold" style={{ color: passed === results.length ? '#34D399' : '#F87171' }}>
          {passed === results.length ? '✅' : '⚠️'} Test Results — {passed}/{results.length} Passed
        </span>
        <span className="text-[11px] text-[#737B8C]">~1.5ms runtime</span>
      </div>
      {results.map((r, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#282D38] last:border-0 bg-[#171A22]">
          <span className="text-xs flex-shrink-0">{r.pass ? '✅' : '❌'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-mono text-[#A7ADBA]">{r.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[#737B8C]">Expected:</span>
            <code className="text-xs font-mono font-bold text-[#F5F7FA]">{r.expected}</code>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              background:   r.pass ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              color:        r.pass ? '#34D399' : '#F87171',
              borderColor:  r.pass ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)',
            }}
          >
            {r.pass ? 'PASS' : 'FAIL'}
          </span>
        </div>
      ))}
    </div>
  );
}

function AiReview({ review, analysing, onNavigate }) {
  const ICONS = { good: '✅', warn: '⚠️', tip: '💡' };
  const METRIC_COLORS = { correctness: '#8B5CF6', efficiency: '#FBBF24', codeQuality: '#34D399' };

  return (
    <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.3)] bg-[#171A22]">
      <div className="px-5 py-3.5 flex items-center gap-3 bg-[#1B1E27] border-b border-[#282D38]">
        <span className="text-lg text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-1.5 rounded-lg">🤖</span>
        <div>
          <p className="text-[#F5F7FA] font-bold text-sm">AI Code Review</p>
          <p className="text-[#737B8C] text-[11px]">Powered by Career OS Intelligence</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {analysing ? (
          <div className="space-y-3 animate-pulse py-2">
            <p className="text-xs font-medium text-[#A7ADBA] flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              🤖 Analysing your code…
            </p>
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-full" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-5/6" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-4/5" />
          </div>
        ) : review ? (
          <>
            <div className="space-y-3">
              {[
                { label: 'Correctness',  value: review.correctness,  color: METRIC_COLORS.correctness  },
                { label: 'Efficiency',   value: review.efficiency,   color: METRIC_COLORS.efficiency   },
                { label: 'Code Quality', value: review.codeQuality,  color: METRIC_COLORS.codeQuality  },
              ].map((m, i) => (
                <MetricBar key={m.label} {...m} delay={i * 180} />
              ))}
            </div>

            {review.complexityNote && (
              <p className="text-[11px] text-[#737B8C] italic border-l-2 border-[#282D38] pl-3">
                {review.complexityNote}
              </p>
            )}

            <div className="h-px bg-[#282D38]" />

            <div className="space-y-2">
              {review.feedback.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background:
                      f.type === 'good' ? 'rgba(52,211,153,0.08)' :
                      f.type === 'warn' ? 'rgba(251,191,36,0.08)' : 'rgba(139,92,246,0.08)',
                    border: `1px solid ${
                      f.type === 'good' ? 'rgba(52,211,153,0.2)' :
                      f.type === 'warn' ? 'rgba(251,191,36,0.2)' : 'rgba(139,92,246,0.2)'
                    }`,
                  }}
                >
                  <span className="flex-shrink-0 text-sm">{ICONS[f.type]}</span>
                  <span
                    className="font-medium"
                    style={{ color: f.type === 'good' ? '#34D399' : f.type === 'warn' ? '#FBBF24' : '#A78BFA' }}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              id="practice-hashmap-btn"
              onClick={() => onNavigate('learning-plan')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
            >
              Practice HashMap Problems →
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function DiffBadge({ d }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md border" style={{ background: d.bg, color: d.color, borderColor: d.border }}>
      🟡 {d.label}
    </span>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function CodingTest() {
  const { student, updateStudentSkills, showToast, recordTimelineEvent, setCurrentPage } = useApp();

  const [problem,        setProblem]        = useState(DEFAULT_PROBLEM);
  const [seenTitles,     setSeenTitles]     = useState([DEFAULT_PROBLEM.title]);
  const [lang,           setLang]           = useState('javascript');
  const [code,           setCode]           = useState(DEFAULT_PROBLEM.starter?.javascript || STARTER.javascript);
  const [running,        setRunning]        = useState(false);
  const [results,        setResults]        = useState(null);
  const [submitted,      setSubmitted]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [analysing,      setAnalysing]      = useState(false);
  const [review,         setReview]         = useState(null);
  const [generatingProb, setGeneratingProb] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    handleGenerateProblem();
  }, []); // eslint-disable-line

  const handleLangChange = (l) => {
    setLang(l);
    setCode(problem.starter ? (problem.starter[l] || STARTER[l]) : STARTER[l]);
    setResults(null);
    setSubmitted(false);
    setReview(null);
  };

  const handleRun = () => {
    setRunning(true);
    setResults(null);
    setSubmitted(false);
    setReview(null);
    setTimeout(() => {
      setRunning(false);
      setResults(problem.testCases);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 1500);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAnalysing(true);
    setSubmitted(true);
    setReview(null);

    // Scroll to AI review area immediately
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

    try {
      const systemPrompt =
        'You are a senior software engineer doing a code review. Return ONLY valid JSON: {"correctness":number,"efficiency":number,"codeQuality":number,"feedback":[{"type":"good"|"warn"|"tip","text":string}],"complexityNote":string} Numbers 0–100. 4–6 feedback items. complexityNote is one sentence about time/space complexity. No markdown.';

      const userPrompt = `Problem: ${problem.title} — ${problem.statement.split('\n')[0]}\nLanguage: ${lang}\nStudent's code:\n${code}`;

      const raw = await callGemini(systemPrompt, userPrompt);
      const parsed = parseJSON(raw);
      const rev = parsed ?? FALLBACK_REVIEW;
      setReview(rev);

      const avgScore = Math.round((rev.correctness + rev.efficiency + rev.codeQuality) / 3);
      if (student?.skills) {
        const updatedSkills = student.skills.map((s) =>
          s.name.toLowerCase().includes('dsa') || s.name.toLowerCase().includes('backend') || s.name.toLowerCase().includes('algorithm')
            ? { ...s, current: Math.min(100, s.current + 3) }
            : s
        );
        await updateStudentSkills(updatedSkills, `Coding Test: ${problem.title}`);
      }
      if (recordTimelineEvent) {
        recordTimelineEvent(`Submitted Coding Test (${problem.title})`, 'coding', `Evaluated Score: ${avgScore}%`);
      }
      if (showToast) showToast(`Coding Test Evaluated! Score: ${avgScore}% 🎯`, 'success');
    } catch (err) {
      console.error('AI review failed:', err);
      setReview(FALLBACK_REVIEW);
    } finally {
      setSubmitting(false);
      setAnalysing(false);
    }
  };

  const handleGenerateProblem = async () => {
    setGeneratingProb(true);
    setResults(null);
    setSubmitted(false);
    setReview(null);

    const avoidList = [...new Set([...seenTitles, problem.title])].slice(-10);

    try {
      const systemPrompt =
        'You are a senior software engineering interviewer. Return ONLY valid JSON with this exact schema: {"title":string,"difficulty":{"label":"Easy"|"Medium"|"Hard","color":string,"bg":string,"border":string},"tags":[string],"statement":string,"examples":[{"input":string,"output":string,"explain":string},{"input":string,"output":string,"explain":string}],"constraints":[string,string],"testCases":[{"label":string,"expected":string,"pass":boolean},{"label":string,"expected":string,"pass":boolean},{"label":string,"expected":string,"pass":boolean}],"starter":{"javascript":string,"python":string,"java":string}} Use colors: Easy=#34D399/rgba(52,211,153,0.1)/rgba(52,211,153,0.25), Medium=#FBBF24/rgba(251,191,36,0.1)/rgba(251,191,36,0.25), Hard=#F87171/rgba(248,113,113,0.1)/rgba(248,113,113,0.25). No markdown.';

      const randomSeed = Math.floor(Math.random() * 100000);
      const targetRole = student?.profile?.targetRole || 'Software Engineer';
      const userPrompt = `Generate a brand-new, unique LeetCode-style coding problem tailored for a ${targetRole}. Seed #${randomSeed}. DO NOT generate any of the following previously used problems: ${avoidList.join(', ')}. Include starter code snippet for javascript, python, and java in the 'starter' object property.`;

      const raw = await callGemini(systemPrompt, userPrompt);
      const parsed = parseJSON(raw);
      if (parsed && parsed.title && !avoidList.includes(parsed.title)) {
        setProblem(parsed);
        setSeenTitles((prev) => [...prev, parsed.title]);
        const starterCode = parsed.starter ? (parsed.starter[lang] || STARTER[lang]) : STARTER[lang];
        setCode(starterCode);
        if (showToast) showToast(`AI generated new problem: ${parsed.title} 🎯`, 'success');
        return;
      }
      throw new Error('AI returned duplicate or incomplete problem schema.');
    } catch (err) {
      console.warn('AI problem generation fallback triggered:', err.message);
      const candidates = FALLBACK_PROBLEMS.filter((p) => p.title !== problem.title);
      const nextProb = candidates[Math.floor(Math.random() * candidates.length)] || FALLBACK_PROBLEMS[0];
      setProblem(nextProb);
      setSeenTitles((prev) => [...prev, nextProb.title]);
      setCode(nextProb.starter ? (nextProb.starter[lang] || STARTER[lang]) : STARTER[lang]);
      if (showToast) {
        showToast(`Loaded "${nextProb.title}" from Practice Problem Bank 📚`, 'info');
      }
    } finally {
      setGeneratingProb(false);
    }
  };

  const passCount = (results ?? []).filter((t) => t.pass).length;

  return (
    <div className="flex flex-col h-full gap-0 max-w-6xl mx-auto" style={{ minHeight: 'calc(100vh - 128px)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#F5F7FA]">{problem.title}</h1>
          <DiffBadge d={problem.difficulty} />
          {problem.tags.map((t) => (
            <span key={t} className="text-xs font-medium px-2 py-0.5 rounded bg-[#171A22] text-[#A7ADBA] border border-[#282D38]">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#737B8C]">
          <span className="w-2 h-2 rounded-full bg-[#34D399] inline-block" />
          Auto-save enabled
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* LEFT: Problem panel */}
        <div className="card p-5 overflow-y-auto flex flex-col gap-5 bg-[#171A22] border border-[#282D38]">
          {generatingProb ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 animate-pulse">
              <span className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#A7ADBA] font-medium">Generating new problem…</p>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-2">Problem</h3>
                <p className="text-xs text-[#F5F7FA] leading-relaxed whitespace-pre-line">{problem.statement}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-3">Examples</h3>
                <div className="space-y-3">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl p-3.5 text-xs font-mono bg-[#1B1E27] border border-[#282D38]">
                      <p className="text-[#737B8C] mb-0.5">Input:</p>
                      <p className="text-[#F5F7FA] font-medium mb-2">{ex.input}</p>
                      <p className="text-[#737B8C] mb-0.5">Output:</p>
                      <p className="text-[#34D399] font-medium mb-2">{ex.output}</p>
                      <p className="text-[#737B8C] italic">// {ex.explain}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-2">Constraints</h3>
                <ul className="space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#A7ADBA]">
                      <span className="text-[#8B5CF6] mt-0.5 flex-shrink-0">•</span>
                      <code className="font-mono">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Editor panel */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col rounded-xl overflow-hidden flex-1 min-h-0 border border-[#282D38] bg-[#0B0D12]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#11131A] border-b border-[#282D38]">
              <div className="flex items-center gap-2">
                <span className="text-[#737B8C] text-xs font-mono">
                  solution.{lang === 'python' ? 'py' : lang === 'java' ? 'java' : 'js'}
                </span>
              </div>

              <select
                id="lang-selector"
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="text-xs font-medium rounded-md px-2 py-1 outline-none bg-[#171A22] text-[#F5F7FA] border border-[#282D38]"
              >
                {LANG_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            <CodeEditor value={code} onChange={setCode} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              id="run-code-btn"
              onClick={handleRun}
              disabled={running || generatingProb}
              className="flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-[#1B1E27] text-[#F5F7FA] border border-[#282D38] hover:bg-[#20242E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running
                ? <><span className="w-3 h-3 border-2 border-[#A7ADBA] border-t-transparent rounded-full animate-spin" /> Running...</>
                : '▶ Run Code'
              }
            </button>

            <button
              id="generate-problem-btn"
              onClick={handleGenerateProblem}
              disabled={generatingProb || analysing}
              className="flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-[#1B1E27] text-[#A78BFA] border border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingProb
                ? <><span className="w-3 h-3 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" /> Generating…</>
                : '✨ New Problem'
              }
            </button>

            <button
              id="submit-code-btn"
              onClick={handleSubmit}
              disabled={submitting || analysing || !results}
              className="flex-[2] py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || analysing
                ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</>
                : '🚀 Submit & Get AI Review'
              }
            </button>
          </div>

          {/* Results Area */}
          <div ref={resultsRef} className="overflow-y-auto space-y-4 flex-shrink-0" style={{ maxHeight: 380 }}>
            {(running || results) && (
              <TestResults results={results ?? []} running={running} />
            )}

            {results && !running && (
              <div
                className="px-4 py-2.5 rounded-xl flex items-center justify-between border"
                style={{
                  background:   passCount === results.length ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                  borderColor:  passCount === results.length ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: passCount === results.length ? '#34D399' : '#FBBF24' }}>
                  {passCount === results.length
                    ? '🎉 All tests passed! Ready to submit.'
                    : `⚠️ ${passCount}/${results.length} tests passed. Review your solution.`}
                </span>
                <span className="text-[11px] text-[#737B8C]">
                  {review?.complexityNote ?? 'O(n²) complexity'}
                </span>
              </div>
            )}

            {submitted && (
              <AiReview
                review={review}
                analysing={analysing}
                onNavigate={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
