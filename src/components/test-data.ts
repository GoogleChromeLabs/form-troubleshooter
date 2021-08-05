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

export const sampleTree = {
  children: [
    {
      attributes: { lang: 'en' },
      children: [
        { name: 'head' },
        {
          children: [
            {
              children: [
                {
                  attributes: {
                    action: '#',
                    id: 'form-1',
                    method: 'post',
                  },
                  children: [
                    {
                      children: [{ text: 'A form with problems' }],
                      name: 'h1',
                    },
                    {
                      children: [
                        {
                          attributes: {
                            class: 'name',
                            for: '',
                            name: 'first-name',
                          },
                          children: [{ text: 'First name' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'given-name',
                            class: '',
                            id: 'given-name',
                            name: 'given-name',
                            required: '',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: {
                            class: 'name',
                            for: 'middle-name',
                          },
                          children: [{ text: 'Middle name(s)' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            class: 'name',
                            id: 'given-name',
                            name: 'additional-name',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { class: '', for: 'family-name' },
                          children: [{ text: 'Family name' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'family-name',
                            class: 'name',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'family-name' },
                          children: [{ text: 'Last name' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            class: 'name',
                            id: 'last-name',
                            name: 'last-name',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'address' },
                          children: [{ text: 'Address' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'address',
                            class: '',
                            id: 'address',
                            name: 'address',
                            required: '',
                          },
                          name: 'textarea',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'address-line1' },
                          children: [{ text: 'Home address line 1' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'addressline-1',
                            class: '',
                            id: 'address-line1',
                            name: 'address-line1',
                            required: '',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'address-line2' },
                          children: [{ text: 'Delivery address' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'delivery address-line2',
                            class: '',
                            id: 'address-line',
                            name: 'address-line1',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          children: [{ text: 'Address line 3' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: '',
                            class: '',
                            id: 'address-line3',
                            name: 'address-line3',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'city' },
                          children: [
                            {
                              attributes: { href: '.' },
                              children: [{ text: 'City' }],
                              name: 'a',
                            },
                          ],
                          name: 'label',
                        },
                        {
                          attributes: {
                            class: '',
                            for: 'city',
                            id: 'city',
                            name: 'city',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'state' },
                          children: [{ text: 'State' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'state',
                            class: '',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { for: 'postal-code' },
                          children: [{ text: 'ZIP or postal code' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: '',
                            class: '',
                            id: 'postal-code',
                            name: 'postal-code',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { class: 'tel', for: 'tel' },
                          children: [{ text: 'Telephone' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autcomplete: 'tel',
                            class: '',
                            id: 'tel-0',
                            name: 'tel-0',
                            required: '',
                            type: 'tel',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: { class: 'tel', for: 'tel-1' },
                          children: [{ text: 'Telephone' }],
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'off',
                            class: '',
                            id: 'tel-1',
                            name: 'tel-1',
                            type: 'tel',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      children: [
                        {
                          attributes: {
                            class: 'tel',
                            for: 'tel-national',
                          },
                          name: 'label',
                        },
                        {
                          attributes: {
                            autocomplete: 'tel-national',
                            class: '',
                            id: 'tel-national',
                            name: 'tel-national',
                            required: '',
                            type: 'tel',
                          },
                          name: 'input',
                        },
                      ],
                      name: 'section',
                    },
                    {
                      attributes: { type: 'submit', value: 'Save' },
                      name: 'input',
                    },
                  ],
                  name: 'form',
                },
                {
                  attributes: { id: 'reset' },
                  children: [{ text: 'Reset' }],
                  name: 'button',
                },
                {
                  attributes: { id: 'form-2' },
                  children: [
                    {
                      attributes: { id: 'hidden', type: 'hidden' },
                      name: 'input',
                    },
                  ],
                  name: 'form',
                },
              ],
              name: 'main',
            },
          ],
          name: 'body',
        },
      ],
      name: 'html',
    },
  ],
};
