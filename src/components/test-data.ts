export const mockedAuditResult: AuditDetails = {
  score: 0.78,
  results: [
    {
      auditType: 'autocomplete-attribute',
      type: 'error',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'text' },
          children: [],
        },
        { name: 'input', attributes: { name: 'password', type: 'password' }, children: [] },
      ],
    },
    {
      auditType: 'autocomplete-valid',
      type: 'error',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'text', autocomplete: 'usrname' },
          children: [],
          context: { suggestion: 'username' },
        },
        { name: 'input', attributes: { name: 'password', type: 'password' }, children: [] },
      ],
    },
    {
      auditType: 'input-type-valid',
      type: 'error',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'check', autocomplete: 'usrename' },
          children: [],
          context: { suggestion: 'checkbox' },
        },
      ],
    },
    {
      auditType: 'label-for',
      type: 'error',
      items: [
        {
          name: 'label',
          attributes: {},
          children: [],
        },
      ],
    },
    {
      auditType: 'input-type-valid',
      type: 'error',
      items: [
        {
          name: 'input',
          attributes: { name: 'username', type: 'check', autocomplete: 'usrename' },
          children: [],
          context: { suggestion: 'checkbox' },
        },
      ],
    },
    {
      auditType: 'input-label',
      type: 'error',
      items: [{ name: 'input', attributes: { name: 'username', type: 'text' }, children: [] }],
    },
    {
      auditType: 'label-unique',
      type: 'error',
      items: [
        {
          name: 'label',
          attributes: {},
          children: [{ text: 'hello', attributes: { for: 'input' }, children: [] }],
          context: { duplicates: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'world' }] }] },
        },
      ],
    },
    {
      auditType: 'unique-ids',
      type: 'error',
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
    },
    {
      auditType: 'unique-names',
      type: 'error',
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
    },
    {
      auditType: 'label-valid-elements',
      type: 'error',
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
    },
    {
      auditType: 'autocomplete-off',
      type: 'warning',
      items: [{ name: 'input', attributes: { name: 'username', type: 'text' }, children: [] }],
    },
  ],
};
