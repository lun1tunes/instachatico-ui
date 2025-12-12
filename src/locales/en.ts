const en = {
  language: {
    label: 'Language',
    options: {
      en: 'English',
      ru: 'Русский'
    }
  },
  formats: {
    date: {
      short: 'MMM d, yyyy',
      withTime: 'MMM d, yyyy HH:mm'
    }
  },
  navigation: {
    media: 'Media',
    comments: 'Comments',
    statistics: 'Statistics',
    settings: 'Settings',
    logout: 'Logout'
  },
  auth: {
    title: 'Instachatico',
    subtitle: 'Comment Bot Moderator',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter your password',
    login: 'Login',
    hint: 'Sign in with your workspace credentials.'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account, connections, and session',
    account: {
      eyebrow: 'Account',
      heading: 'Account information',
      description: 'Your current authenticated session details.',
      username: 'Username',
      unknown: 'Unknown user',
      apiBase: 'API base URL',
      notProvided: 'Not provided',
      scopes: 'Scopes',
      noScopes: 'No scopes provided'
    }
  },
  youtubeAuth: {
    eyebrow: 'YouTube',
    title: 'Connect YouTube',
    subtitle: 'Authorize Google to manage and moderate your YouTube comments.',
    scopeTitle: 'Required scope',
    redirectLabel: 'Redirect URI',
    redirectNote: 'Use this exact redirect URI in Google Cloud for this environment.',
    connectHeading: 'Authorization',
    connectCopy: 'Start the OAuth flow to connect your YouTube account.',
    cta: 'Continue',
    connectedCta: 'YouTube connected',
    consentHint: "You'll be redirected to Google to grant comment management access.",
    exchanging: 'Completing Google sign-in...',
    connectedStatus: 'YouTube connected. {{ channel }} is ready.',
    retry: 'Retry',
    rerunConsent: 'Re-run consent if the session expired.',
    stateMismatch: 'State is missing, expired, or mismatched. Please start again.',
    missingCode: 'Missing authorization code. Please try again.',
    accessDenied: 'Access denied. You can retry authorization.',
    genericError: 'Unable to complete authorization. Please try again.'
  },
  common: {
    actions: {
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      close: 'Close',
      create: 'Create',
      logout: 'Logout',
      view: 'View'
    },
    placeholders: {
      image: 'Image',
      context: 'Provide context about this media post to help AI generate better responses...'
    },
    hints: {
      markdown: 'Supports Markdown formatting. Press ESC to cancel.'
    }
  },
  media: {
    list: {
      title: 'Media Posts',
      subtitle: 'Manage Instagram posts and comments',
      loading: 'Loading media...',
      error: 'Failed to load media'
    },
    card: {
      types: {
        image: 'Post',
        video: 'Video',
        carousel: 'Carousel',
        unknown: 'Unknown'
      },
      aiProcessing: 'AI processing',
      allowComments: 'Allow Comments',
      allowCommentsWarning: 'Disabling deletes all comments permanently',
      viewOnInstagram: 'View on Instagram',
      caption: 'Caption',
      aiContext: 'AI Context',
      editContext: 'Edit',
      settings: 'Settings',
      createdAt: 'Created at',
      a11y: {
        previousImage: 'Previous image',
        nextImage: 'Next image'
      }
    },
    detail: {
      back: 'Back to Media',
      comments: 'Comments',
      loading: 'Loading media...',
      type: 'Type',
      likes: 'Likes',
      commentsCount: 'Comments',
      createdAt: 'Created at',
      editContextTitle: 'Edit AI Context',
      saveContext: 'Save Context',
      enableProcessing: 'Enable AI processing'
    },
    stats: {
      tooltipTotal: 'Total is the overall count.',
      tooltipDelta: '(+x) shows the increase during the last hour.',
      likes: 'Likes',
      questions: 'Questions',
      negative: 'Negative',
      positive: 'Positive',
      urgent: 'Urgent / Issue',
      other: 'Other',
      legendLabel: 'Stats legend: total count and last-hour growth.',
      titles: {
        likes: 'Likes total',
        questions: 'Questions total / last hour',
        negative: 'Negative feedback total / last hour',
        positive: 'Positive feedback total / last hour',
        urgent: 'Urgent issues total / last hour',
        other: 'Other classifications total / last hour'
      }
    }
  },
  comments: {
    page: {
      title: 'All Comments',
      subtitle: 'Monitor the latest comments from every media post'
    },
    loading: 'Loading comments...',
    empty: 'No comments found',
    filters: {
      visibility: 'Visibility',
      visibilityOptions: {
        all: 'All',
        visible: 'Visible',
        hidden: 'Hidden'
      },
      deleted: 'Deleted',
      deletedOptions: {
        all: 'All',
        active: 'Active',
        deleted: 'Deleted'
      },
      status: 'Status',
      type: 'Type',
      clear: 'Clear all filters'
    },
    statusLabels: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      retry: 'Retry'
    },
    classificationLabels: {
      positive: 'Positive',
      critical: 'Critical',
      urgent: 'Urgent',
      question: 'Question',
      partnership: 'Partnership',
      toxic: 'Toxic',
      spam: 'Spam'
    },
    media: {
      noCaption: 'No caption',
      loading: 'Loading media...',
      unavailable: 'Media unavailable',
      noPreview: 'No preview',
      openDetails: 'Open media details'
    },
    card: {
      newBadge: 'NEW',
      replyBadge: 'Reply',
      deletedBadge: 'Deleted',
      hiddenBadge: 'Hidden',
      classificationTitle: 'Classification details',
      processedAt: 'Processed at:',
      confidence: 'Confidence:',
      reasoning: 'Reasoning:',
      errorTitle: 'Error while classification',
      createAnswer: 'Create Answer',
      answersTitle: 'Answers',
      loadingAnswer: 'Creating answer...',
      checkInstagram: 'This comment has been permanently deleted from Instagram',
      markAsRead: 'Mark as read',
      pendingClassification: 'Pending Classification',
      createAnswerTitle: 'Create Answer for Comment',
      answerPlaceholder: 'Write your answer to this question/inquiry. Markdown formatting is supported...',
      updateClassificationTitle: 'Update Classification',
      settings: {
        hide: {
          hide: 'Hide',
          unhide: 'Unhide'
        },
        delete: 'Delete',
        deletedLabel: 'Deleted'
      },
      toggleClassification: 'Click to toggle classification details'
    },
    confirmations: {
      deleteComment: {
        title: 'Delete Comment',
        message: 'This comment will be deleted permanently from Instagram. This action cannot be undone.',
        confirm: 'Delete Permanently',
        cancel: 'Cancel'
      },
      deleteAnswer: {
        title: 'Delete Answer',
        message: 'This AI-generated answer will be deleted permanently. Do you want to continue?',
        confirm: 'Delete Answer',
        cancel: 'Cancel'
      },
      disableComments: {
        title: 'Disable Comments',
        message: 'Disabling comments will permanently delete all existing comments from Instagram. This action cannot be undone.',
        confirm: 'Disable & Delete All',
        cancel: 'Cancel'
      }
    },
    answers: {
      replyError: 'Reply error',
      replyErrorHint: 'Possible reason - user deleted comment immediately after publishing',
      sent: 'Sent',
      inactive: 'Inactive (Comment Deleted)',
      error: 'Error',
      updating: 'Updating answer...',
      editTitle: 'Edit AI Generated Answer',
      placeholder: 'Edit the AI-generated answer. Markdown formatting is supported...',
      save: 'Update Answer'
    }
    ,
    form: {
      classificationType: 'Classification Type',
      reasoning: 'Reasoning',
      characters: '{count} characters',
      placeholder: 'Explain why this classification is appropriate... Markdown is supported.',
      hint: 'Supports Markdown formatting. Press ESC to cancel.',
      submit: 'Update Classification',
      unsaved: {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to cancel without saving?',
        confirm: 'Discard Changes',
        cancel: 'Continue Editing'
      }
    }
  },
  statistics: {
    page: {
      title: 'Performance Insights',
      subtitle: 'Generate engagement reports for Instagram activity'
    },
    controls: {
      period: 'Select period',
      generate: 'Generate report',
      retry: 'Try again',
      lastUpdated: 'Generated at {date}'
    },
    periods: {
      lastWeek: 'Last week',
      lastMonth: 'Last month',
      last3Months: 'Last 3 months',
      last6Months: 'Last 6 months'
    },
    loading: 'Collecting statistics...',
    empty: 'No statistics available for the selected period.',
    prompt: 'Select a period and click “Generate report” to see Instagram insights.',
    table: {
      metric: 'Metric'
    },
    metrics: {
      erReach: 'ER Reach %',
      likes: 'Likes',
      comments: 'Comments',
      saves: 'Saves',
      shares: 'Reposts',
      reach: 'Reach'
    },
    followers: {
      current: 'Current followers',
      periodLabel: 'Period: {period}',
      description: 'Monthly follower totals with deltas for each period.'
    },
    moderation: {
      title: 'Moderation overview',
      subtitle: 'Content verification and complaint handling',
      section: {
        summaryTitle: 'Content verification & complaints',
        summaryDescription: 'Totals for verified items plus complaint handling KPIs.',
        violationsTitle: 'Violations breakdown',
        violationsDescription: 'Distribution of detected violation categories.',
        aiTitle: 'AI moderator',
        aiDescription: 'Automated moderation actions for the selected period.'
      },
      metrics: {
        verified: 'Verified content',
        complaints: 'Total complaints',
        complaintsProcessed: 'Complaints processed',
        reactionTime: 'Avg reaction time'
      },
      violations: {
        spam: 'Spam / advertising',
        adult: '18+ content',
        toxic: 'Insults / toxicity'
      },
      ai: {
        deleted: 'Deleted content',
        hidden: 'Hidden comments'
      },
      classificationsTitle: 'Verified content classifications',
      classifications: {
        positive: 'Positive feedback',
        critical: 'Critical feedback',
        urgent: 'Urgent issue',
        question: 'Question / inquiry',
        partnership: 'Partnership',
        toxic: 'Toxic / abusive',
        spam: 'Spam / irrelevant'
      },
      noExamples: 'no examples'
    }
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    ellipsis: '...'
  },
  tooltips: {
    language: 'Change interface language'
  },
  editor: {
    preview: 'Preview',
    defaultTitle: 'Edit Content',
    defaultPlaceholder: 'Write your content here... Markdown is supported.',
    saveChanges: 'Save Changes',
    closeHint: 'Close (ESC)',
    viewModes: {
      edit: 'Edit Only',
      split: 'Split View',
      preview: 'Preview Only'
    },
    toolbar: {
      bold: 'Bold (Ctrl+B)',
      italic: 'Italic (Ctrl+I)',
      code: 'Inline code',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      unorderedList: 'Unordered List',
      orderedList: 'Ordered List',
      link: 'Insert Link'
    },
    unsaved: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to close without saving?',
      confirm: 'Discard Changes',
      cancel: 'Continue Editing'
    }
  }
}

export type TranslationSchema = typeof en

export default en
