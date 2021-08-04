export const mockedAuditResult: AuditDetails = {
  score: 0.78,
  results: [
    {
      auditType: 'autocomplete-attribute',
      type: 'error',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'text' },
          children: [],
        },
        { name: 'input', attributes: { name: 'password', type: 'password' }, children: [] },
      ],
      references: [],
    },
    {
      auditType: 'autocomplete-valid',
      type: 'error',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'text', autocomplete: 'usrname' },
          children: [],
          context: { suggestion: 'username' },
        },
        { name: 'input', attributes: { name: 'password', type: 'password' }, children: [] },
      ],
      references: [],
    },
    {
      auditType: 'input-type-valid',
      type: 'error',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'check', autocomplete: 'usrename' },
          children: [],
          context: { suggestion: 'checkbox' },
        },
      ],
      references: [],
    },
    {
      auditType: 'label-for',
      type: 'error',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [
        {
          name: 'label',
          attributes: {},
          children: [],
        },
      ],
      references: [],
    },
    {
      auditType: 'input-type-valid',
      type: 'error',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'check', autocomplete: 'usrename' },
          children: [],
          context: { suggestion: 'checkbox' },
        },
      ],
      references: [],
    },
    {
      auditType: 'input-label',
      type: 'error',
      title:
        'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      items: [{ name: 'input', attributes: { name: 'username', type: 'text' }, children: [] }],
      references: [],
    },
    {
      auditType: 'label-unique',
      type: 'error',
      title:
        'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      items: [
        {
          name: 'label',
          attributes: {},
          children: [{ text: 'hello', attributes: { for: 'input' }, children: [] }],
          context: { duplicates: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'world' }] }] },
        },
      ],
      references: [],
    },
    {
      auditType: 'unique-ids',
      type: 'error',
      title:
        'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      items: [
        {
          name: 'input',
          attributes: { name: 'input1', id: 'input' },
          children: [],
          context: {
            duplicates: [
              {
                name: 'input',
                attributes: { name: 'input2', id: 'input' },
                children: [],
              },
              {
                name: 'input',
                attributes: { name: 'input3', id: 'input' },
                children: [],
              },
            ],
          },
        },
      ],
      references: [],
    },
    {
      auditType: 'unique-names',
      type: 'error',
      title:
        'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      items: [
        {
          name: 'input',
          attributes: { id: 'input1', name: 'input' },
          children: [],
          context: {
            duplicates: [
              {
                name: 'input',
                attributes: { id: 'input2', name: 'input' },
                children: [],
              },
              {
                name: 'input',
                attributes: { id: 'input3', name: 'input' },
                children: [],
              },
            ],
          },
        },
      ],
      references: [],
    },
    {
      auditType: 'label-valid-elements',
      type: 'error',
      title:
        'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      items: [
        {
          name: 'label',
          attributes: {},
          children: [
            { name: 'a', attributes: {}, children: [] },
            { name: 'h1', attributes: {}, children: [] },
          ],
          context: {
            fields: [
              { name: 'a', attributes: {}, children: [] },
              { name: 'h1', attributes: {}, children: [] },
            ],
          },
        },
      ],
      references: [],
    },
    {
      auditType: 'autocomplete-off',
      type: 'warning',
      title: 'Increase conversions by using correct autocomplete attributes',
      items: [{ name: 'input', attributes: { name: 'username', type: 'text' }, children: [] }],
      references: [],
    },
  ],
};
