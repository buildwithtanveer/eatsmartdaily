/**
 * Accessibility (a11y) utilities for improving UI/UX
 * Following WCAG 2.1 AA standards
 */

/**
 * Generate accessible aria-label for loading states
 */
export function getLoadingAriaLabel(context: string): string {
  return `Loading ${context}, please wait`;
}

/**
 * Generate accessible aria-label for error states
 */
export function getErrorAriaLabel(error: string): string {
  return `Error: ${error}. Please check your input and try again`;
}

/**
 * Generate accessible aria-label for success states
 */
export function getSuccessAriaLabel(message: string): string {
  return `Success: ${message}`;
}

/**
 * Accessible toast/notification role and live region attributes
 */
export const a11yNotificationAttrs = {
  role: "status",
  "aria-live": "polite" as const,
  "aria-atomic": "true" as const,
};

/**
 * Accessible alert role for error messages
 */
export const a11yAlertAttrs = {
  role: "alert",
  "aria-live": "assertive" as const,
  "aria-atomic": "true" as const,
};

/**
 * Create accessible skip link attributes
 */
export function getSkipLinkAttrs(target: string) {
  return {
    href: target,
    className:
      "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-black focus:text-white focus:rounded focus:text-sm focus:font-bold",
    title: "Skip to main content",
  };
}

/**
 * Accessible button attributes for common patterns
 */
export const a11yButtonAttrs = {
  close: {
    "aria-label": "Close",
    title: "Close dialog (Esc)",
  },
  menu: {
    "aria-haspopup": "menu" as const,
    "aria-expanded": false as const,
  },
  toggle: (isActive: boolean) => ({
    "aria-pressed": isActive,
    role: "button" as const,
  }),
};

/**
 * Generate aria-label for pagination
 */
export function getPaginationAriaLabel(
  currentPage: number,
  totalPages: number,
): string {
  return `Page ${currentPage} of ${totalPages}`;
}

/**
 * Generate aria-label for form fields with validation
 */
export function getFormFieldAriaLabel(
  label: string,
  required: boolean,
  error?: string,
): string {
  let description = label;
  if (required) description += " (required)";
  if (error) description += ` - Error: ${error}`;
  return description;
}

/**
 * Create description IDs for form fields
 */
export function getFormFieldDescriptionId(fieldName: string): string {
  return `${fieldName}-description`;
}

/**
 * Create error IDs for form fields
 */
export function getFormFieldErrorId(fieldName: string): string {
  return `${fieldName}-error`;
}

/**
 * Get aria-describedby attributes for form fields
 */
export function getFormFieldDescribedBy(
  fieldName: string,
  hasError: boolean,
  hasHint: boolean,
): string {
  const ids: string[] = [];
  if (hasHint) ids.push(getFormFieldDescriptionId(fieldName));
  if (hasError) ids.push(getFormFieldErrorId(fieldName));
  return ids.join(" ");
}

/**
 * Accessible heading level utilities
 */
export function getHeadingLevel(
  depth: number,
): "h2" | "h3" | "h4" | "h5" | "h6" {
  const level = Math.min(Math.max(depth + 1, 2), 6);
  return `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * ARIA labels for common UI patterns
 */
export const a11yLabels = {
  // Navigation
  navigation: "Main navigation",
  sidebar: "Sidebar navigation",
  breadcrumb: "Breadcrumb navigation",

  // Search
  search: "Search posts and pages",
  clearSearch: "Clear search results",

  // Forms
  submitForm: "Submit form",
  resetForm: "Reset form fields",

  // Comments
  loadingComments: "Loading comments",
  commentForm: "Post a comment",
  replyComment: "Reply to this comment",

  // Pagination
  previousPage: "Go to previous page",
  nextPage: "Go to next page",
  currentPage: "Current page",

  // Loading
  loading: "Loading content",
  loadingPage: "Loading page content",

  // Expandable
  expandContent: "Expand content",
  collapseContent: "Collapse content",

  // Modal
  closeModal: "Close modal dialog",
  openModal: "Open modal dialog",

  // Menu
  openMenu: "Open menu",
  closeMenu: "Close menu",
  mainMenu: "Main menu",

  // Social
  shareTwitter: "Share on Twitter",
  shareFacebook: "Share on Facebook",
  shareLinkedIn: "Share on LinkedIn",
  sharePinterest: "Share on Pinterest",

  // Admin
  editPost: "Edit this post",
  deletePost: "Delete this post",
  publishPost: "Publish this post",
  previewPost: "Preview this post",
};

/**
 * Skip links for keyboard navigation
 */
export const skipLinks = [
  { href: "#main-content", label: "Skip to main content" },
  { href: "#sidebar", label: "Skip to sidebar" },
  { href: "#footer", label: "Skip to footer" },
];
