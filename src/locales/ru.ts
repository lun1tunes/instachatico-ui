const ru = {
  language: {
    label: 'Язык',
    options: {
      en: 'English',
      ru: 'Русский'
    }
  },
  formats: {
    date: {
      short: 'd MMMM yyyy',
      withTime: 'd MMMM yyyy HH:mm'
    }
  },
  navigation: {
    media: 'Медиа',
    comments: 'Комментарии',
    statistics: 'Статистика',
    settings: 'Настройки',
    logout: 'Выйти'
  },
  auth: {
    title: 'Instachatico',
    subtitle: 'Модератор комментариев',
    username: 'Имя пользователя',
    password: 'Пароль',
    usernamePlaceholder: 'Введите имя пользователя',
    passwordPlaceholder: 'Введите пароль',
    login: 'Войти',
    hint: 'Войдите с помощью своих учетных данных рабочей среды.'
  },
  settings: {
    title: 'Настройки',
    subtitle: 'Управляйте аккаунтом, подключениями и сессией',
    account: {
      eyebrow: 'Аккаунт',
      heading: 'Данные аккаунта',
      description: 'Текущая информация об авторизованной сессии.',
      username: 'Имя пользователя',
      unknown: 'Неизвестно',
      apiBase: 'API базовый URL',
      notProvided: 'Не указан',
      scopes: 'Scopes',
      noScopes: 'Список пуст'
    }
  },
  youtubeAuth: {
    eyebrow: 'YouTube',
    title: 'Подключить YouTube',
    subtitle: 'Дайте доступ Google для управления и модерации комментариев на YouTube.',
    scopeTitle: 'Необходимый scope',
    redirectLabel: 'Redirect URI',
    redirectNote: 'Убедитесь, что этот URI указан в Google Cloud для текущего окружения.',
    connectHeading: 'Авторизация',
    connectCopy: 'Запустите OAuth, чтобы подключить ваш аккаунт YouTube.',
    cta: 'Подключить YouTube',
    connectedCta: 'YouTube подключен',
    reconnectCta: 'Переподключить YouTube',
    consentHint: 'Вы будете перенаправлены в Google для выдачи доступа к управлению комментариями.',
    exchanging: 'Завершаем вход через Google...',
    connectedStatus: 'YouTube подключен. {channel} готов.',
    connectedNeedsRefresh: 'Подключено (нужно обновить доступ).',
    disconnectCta: 'Выйти из YouTube',
    disconnectTitle: 'Выйти из YouTube?',
    disconnectMessage: 'Токены YouTube будут удалены. Вы сможете подключить снова в любой момент.',
    disconnectConfirm: 'Выйти',
    disconnectedStatus: 'YouTube отключён.',
    alreadyDisconnected: 'Уже отключено.',
    disconnectedWorkerSyncFailed: 'Отключено локально; синхронизация воркера не удалась.',
    retry: 'Повторить',
    rerunConsent: 'Запустите согласие ещё раз, если сессия истекла.',
    stateMismatch: 'State отсутствует, устарел или не совпадает. Попробуйте снова.',
    missingCode: 'Нет authorization code. Попробуйте снова.',
    accessDenied: 'Доступ отклонён. Можно попробовать ещё раз.',
    genericError: 'Не удалось завершить авторизацию. Попробуйте снова.'
  },
  common: {
    actions: {
      retry: 'Повторить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      delete: 'Удалить',
      edit: 'Редактировать',
      save: 'Сохранить',
      close: 'Закрыть',
      create: 'Создать',
      logout: 'Выйти',
      view: 'Открыть'
    },
    placeholders: {
      image: 'Изображение',
      context: 'Опишите публикацию, чтобы ИИ готовил ответы точнее...'
    },
    hints: {
      markdown: 'Поддерживается Markdown. Нажмите ESC, чтобы отменить.'
    }
  },
  media: {
    list: {
      title: 'Публикации',
      subtitle: 'Управляйте постами и комментариями Instagram и YouTube',
      loading: 'Загрузка публикаций...',
      error: 'Не удалось загрузить публикации',
      filterLabel: 'Фильтр по платформе',
      filters: {
        all: 'Все',
        instagram: 'Instagram',
        youtube: 'YouTube'
      }
    },
    card: {
      types: {
        image: 'Публикация',
        video: 'Видео',
        carousel: 'Карусель',
        unknown: 'Неизвестно'
      },
      aiProcessing: 'AI обработка',
      allowComments: 'Разрешить комментарии',
      allowCommentsWarning: 'Отключение удалит все комментарии безвозвратно',
      viewOnInstagram: 'Открыть в Instagram',
      viewOnYouTube: 'Открыть в YouTube',
      caption: 'Подпись',
      aiContext: 'AI контекст',
      editContext: 'Редактировать',
      settings: 'Настройки',
      createdAt: 'Создано',
      a11y: {
        previousImage: 'Предыдущее изображение',
        nextImage: 'Следующее изображение'
      }
    },
    detail: {
      back: 'Назад к медиа',
      comments: 'Комментарии',
      loading: 'Загрузка медиа...',
      type: 'Тип',
      likes: 'Лайки',
      commentsCount: 'Комментарии',
      createdAt: 'Создано',
      editContextTitle: 'Редактирование AI контекста',
      saveContext: 'Сохранить контекст',
      enableProcessing: 'Включить AI обработку'
    },
    stats: {
      tooltipTotal: 'Общее количество элементов.',
      tooltipDelta: '(+x) показывает прирост за последний час.',
      likes: 'Лайки',
      questions: 'Вопросы',
      negative: 'Негатив',
      positive: 'Позитив',
      urgent: 'Срочно / проблема',
      other: 'Другое',
      legendLabel: 'Подсказка по статистике: общее число и рост за час.',
      titles: {
        likes: 'Всего лайков',
        questions: 'Вопросы — всего и за последний час',
        negative: 'Негатив — всего и за последний час',
        positive: 'Позитив — всего и за последний час',
        urgent: 'Срочно — всего и за последний час',
        other: 'Другое — всего и за последний час'
      }
    }
  },
  comments: {
    page: {
      title: 'Все комментарии',
      subtitle: 'Отслеживайте последние комментарии со всех публикаций'
    },
    loading: 'Загрузка комментариев...',
    empty: 'Комментарии не найдены',
    filters: {
      visibility: 'Видимость',
      visibilityOptions: {
        all: 'Все',
        visible: 'Показаны',
        hidden: 'Скрытые'
      },
      deleted: 'Удалённые',
      deletedOptions: {
        all: 'Все',
        active: 'Активные',
        deleted: 'Удалённые'
      },
      status: 'Статус',
      type: 'Тип',
      clear: 'Сбросить фильтры'
    },
    statusLabels: {
      pending: 'В ожидании',
      processing: 'Обрабатывается',
      completed: 'Готово',
      failed: 'Ошибка',
      retry: 'Повтор'
    },
    classificationLabels: {
      positive: 'Позитив',
      critical: 'Критика',
      urgent: 'Срочно',
      question: 'Вопрос',
      partnership: 'Партнерство',
      toxic: 'Токсично',
      spam: 'Спам'
    },
    media: {
      noCaption: 'Без подписи',
      loading: 'Загрузка медиа...',
      unavailable: 'Медиа недоступно',
      noPreview: 'Нет превью',
      openDetails: 'Открыть карточку публикации'
    },
    card: {
      newBadge: 'НОВОЕ',
      replyBadge: 'Ответ',
      deletedBadge: 'Удалено',
      hiddenBadge: 'Скрыто',
      classificationTitle: 'Детали классификации',
      processedAt: 'Обработано:',
      confidence: 'Уверенность:',
      reasoning: 'Обоснование:',
      errorTitle: 'Ошибка классификации',
      createAnswer: 'Создать ответ',
      answersTitle: 'Ответы',
      loadingAnswer: 'Создание ответа...',
      checkInstagram: 'Комментарий удалён в Instagram безвозвратно',
      markAsRead: 'Отметить как прочитано',
      pendingClassification: 'Классификация ожидается',
      createAnswerTitle: 'Создать ответ на комментарий',
      answerPlaceholder: 'Напишите ответ на вопрос. Поддерживается формат Markdown...',
      updateClassificationTitle: 'Изменение классификации',
      settings: {
        hide: {
          hide: 'Скрыть',
          unhide: 'Показать'
        },
        delete: 'Удалить',
        deletedLabel: 'Удалено'
      },
      toggleClassification: 'Нажмите, чтобы посмотреть детали классификации'
    },
    confirmations: {
      deleteComment: {
        title: 'Удалить комментарий',
        message: 'Комментарий будет навсегда удалён из Instagram. Это действие нельзя отменить.',
        confirm: 'Удалить навсегда',
        cancel: 'Отмена'
      },
      deleteAnswer: {
        title: 'Удалить ответ',
        message: 'AI-ответ будет удалён безвозвратно. Продолжить?',
        confirm: 'Удалить ответ',
        cancel: 'Отмена'
      },
      disableComments: {
        title: 'Отключить комментарии',
        message: 'Отключение комментариев навсегда удалит все существующие комментарии в Instagram. Вы уверены?',
        confirm: 'Отключить и удалить',
        cancel: 'Отмена'
      }
    },
    answers: {
      replyError: 'Ошибка отправки',
      replyErrorHint: 'Возможная причина — пользователь удалил комментарий сразу после публикации',
      sent: 'Отправлено',
      inactive: 'Неактивно (комментарий удалён)',
      error: 'Ошибка',
      updating: 'Обновление ответа...',
      editTitle: 'Редактирование AI-ответа',
      placeholder: 'Измените AI-ответ. Поддерживается Markdown...',
      save: 'Обновить ответ'
    }
    ,
    form: {
      classificationType: 'Тип классификации',
      reasoning: 'Обоснование',
      characters: '{count} символов',
      placeholder: 'Объясните, почему выбрана эта классификация. Поддерживается Markdown.',
      hint: 'Поддерживается Markdown. Нажмите ESC, чтобы отменить.',
      submit: 'Обновить классификацию',
      unsaved: {
        title: 'Несохранённые изменения',
        message: 'Есть несохранённые изменения. Отменить без сохранения?',
        confirm: 'Отменить и выйти',
        cancel: 'Продолжить редактирование'
      }
    }
  },
  statistics: {
    page: {
      title: 'Отчёт по активности',
      subtitle: 'Получите сводку вовлечённости в Instagram'
    },
    controls: {
      period: 'Период отчёта',
      generate: 'Сформировать отчёт',
      retry: 'Повторить',
      lastUpdated: 'Сформировано {date}'
    },
    periods: {
      lastWeek: 'За неделю',
      lastMonth: 'За месяц',
      last3Months: 'За 3 месяца',
      last6Months: 'За 6 месяцев'
    },
    loading: 'Формируем статистику...',
    empty: 'Для выбранного периода нет данных.',
    prompt: 'Выберите период и нажмите «Сформировать отчёт», чтобы увидеть статистику.',
    table: {
      metric: 'Показатель'
    },
    metrics: {
      erReach: 'ER Reach %',
      likes: 'Лайки',
      comments: 'Комментарии',
      saves: 'Сохранения',
      shares: 'Репосты',
      reach: 'Охват'
    },
    followers: {
      current: 'Текущие подписчики',
      periodLabel: 'Период: {period}',
      description: 'Динамика подписчиков по месяцам и изменения за период.'
    },
    moderation: {
      title: 'Модерация',
      subtitle: 'Проверенный контент и обращения',
      section: {
        summaryTitle: 'Проверка контента и жалобы',
        summaryDescription: 'Итоги по проверенному контенту и работе с жалобами.',
        violationsTitle: 'Нарушения',
        violationsDescription: 'Распределение обнаруженных нарушений.',
        aiTitle: 'AI модератор',
        aiDescription: 'Действия автоматической модерации за период.'
      },
      metrics: {
        verified: 'Проверенный контент',
        complaints: 'Жалобы пользователей',
        complaintsProcessed: 'Жалобы обработаны',
        reactionTime: 'Среднее время реакции'
      },
      violations: {
        spam: 'Спам / реклама',
        adult: '18+ контент',
        toxic: 'Оскорбления / токсичность'
      },
      ai: {
        deleted: 'Удалённые материалы',
        hidden: 'Скрытые комментарии'
      },
      classificationsTitle: 'Классификация проверенных комментариев',
      classifications: {
        positive: 'Позитив',
        critical: 'Критика',
        urgent: 'Срочно',
        question: 'Вопрос',
        partnership: 'Партнёрство',
        toxic: 'Токсично',
        spam: 'Спам'
      },
      noExamples: 'примеров нет'
    }
  },
  pagination: {
    previous: 'Назад',
    next: 'Вперёд',
    ellipsis: '...'
  },
  tooltips: {
    language: 'Сменить язык интерфейса'
  },
  editor: {
    preview: 'Предпросмотр',
    defaultTitle: 'Редактирование',
    defaultPlaceholder: 'Введите текст здесь. Поддерживается Markdown.',
    saveChanges: 'Сохранить изменения',
    closeHint: 'Закрыть (ESC)',
    viewModes: {
      edit: 'Только редактор',
      split: 'Разделённый режим',
      preview: 'Только просмотр'
    },
    toolbar: {
      bold: 'Полужирный (Ctrl+B)',
      italic: 'Курсив (Ctrl+I)',
      code: 'Вставить код',
      heading1: 'Заголовок 1',
      heading2: 'Заголовок 2',
      heading3: 'Заголовок 3',
      unorderedList: 'Маркированный список',
      orderedList: 'Нумерованный список',
      link: 'Вставить ссылку'
    },
    unsaved: {
      title: 'Несохранённые изменения',
      message: 'Есть несохранённые изменения. Закрыть без сохранения?',
      confirm: 'Отменить изменения',
      cancel: 'Продолжить редактирование'
    }
  }
}

export default ru
