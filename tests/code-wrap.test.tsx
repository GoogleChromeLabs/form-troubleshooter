import { h } from 'preact';
import CodeWrap from '../src/components/code-wrap';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow } from 'enzyme';

describe('CodeWrap', function () {
  test('Wraps a string in code', function () {
    const context = shallow(<CodeWrap text="hello" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello' },
    ]);
  });

  test('Wraps a string in code when text not found', function () {
    const context = shallow(<CodeWrap text="hello" emphasize="boo" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello' },
    ]);
  });

  test('Wraps a string in code with emphasis (beginning of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="hello" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello', className: 'emphasize' },
      { text: ' world' },
    ]);
  });

  test('Wraps a string in code with emphasis (middle of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="lo wo" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hel' },
      { text: 'lo wo', className: 'emphasize' },
      { text: 'rld' },
    ]);
  });

  test('Wraps a string in code with emphasis (end of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="world" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello ' },
      { className: 'emphasize', text: 'world' },
    ]);
  });

  test('Wraps a string in code with emphasis on first instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize="hello" />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello', className: 'emphasize' },
      { text: ' world hello hello' },
    ]);
  });

  test('Wraps a string in code with emphasis on all instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize={/hello/g} />);
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: 'hello', className: 'emphasize' },
      { text: ' world ' },
      { text: 'hello', className: 'emphasize' },
      { text: ' ' },
      { text: 'hello', className: 'emphasize' },
    ]);
  });

  test('Wraps a string in code with emphasis on a full regular expression', function () {
    const context = shallow(
      <CodeWrap text='<input class="StripeField--fake" autocomplete="fake" ...>' emphasize={/autocomplete="[^"]*"/} />,
    );
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: '<input class="StripeField--fake" ' },
      { className: 'emphasize', text: 'autocomplete="fake"' },
      { text: ' ...>' },
    ]);
  });

  test('Wraps a string in code with emphasis on the first capture group of a regular expression', function () {
    const context = shallow(
      <CodeWrap
        text='<input class="StripeField--fake" autocomplete="fake" ...>'
        emphasize={/autocomplete="([^"]*)"/}
      />,
    );
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: '<input class="StripeField--fake" autocomplete="' },
      { text: 'fake', className: 'emphasize' },
      { text: '" ...>' },
    ]);
  });

  test('Wraps a string in code with emphasis on the first capture group of a global regular expression', function () {
    const context = shallow(
      <CodeWrap text='<input class="StripeField--fake" autocomplete="fake" ...>' emphasize={/\b(\w+)="([^"]*)"/g} />,
    );
    expect(context.find('code').map(elem => ({ className: elem.prop('className'), text: elem.text() }))).toEqual([
      { text: '<input ' },
      { text: 'class', className: 'emphasize' },
      { text: '="StripeField--fake" ' },
      { text: 'autocomplete', className: 'emphasize' },
      { text: '="fake" ...>' },
    ]);
  });
});
