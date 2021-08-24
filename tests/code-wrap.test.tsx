import { h } from 'preact';
import CodeWrap from '../src/components/code-wrap';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow, ShallowWrapper } from 'enzyme';

function getCodeInfo(context: ShallowWrapper) {
  return context
    .find('code')
    .children()
    .map(elem => ({ text: elem.text(), type: elem.type() }));
}

describe('CodeWrap', function () {
  test('Wraps a string in code', function () {
    const context = shallow(<CodeWrap text="hello" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello' }]);
  });

  test('Wraps a string in code when text not found', function () {
    const context = shallow(<CodeWrap text="hello" emphasize="boo" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello' }]);
  });

  test('Wraps a string in code with emphasis (beginning of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="hello" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello', type: 'strong' }, { text: ' world' }]);
  });

  test('Wraps a string in code with emphasis (middle of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="lo wo" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hel' }, { text: 'lo wo', type: 'strong' }, { text: 'rld' }]);
  });

  test('Wraps a string in code with emphasis (end of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="world" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello ' }, { text: 'world', type: 'strong' }]);
  });

  test('Wraps a string in code with emphasis on first instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize="hello" />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello', type: 'strong' }, { text: ' world hello hello' }]);
  });

  test('Wraps a string in code with emphasis on all instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize={/hello/g} />);
    expect(getCodeInfo(context)).toEqual([
      { text: 'hello', type: 'strong' },
      { text: ' world ' },
      { text: 'hello', type: 'strong' },
      { text: ' ' },
      { text: 'hello', type: 'strong' },
    ]);
  });

  test('Wraps a string in code with emphasis on a full regular expression', function () {
    const context = shallow(
      <CodeWrap text='<input class="StripeField--fake" autocomplete="fake" ...>' emphasize={/autocomplete="[^"]*"/} />,
    );
    expect(getCodeInfo(context)).toEqual([
      { text: '<input class="StripeField--fake" ' },
      { text: 'autocomplete="fake"', type: 'strong' },
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
    expect(getCodeInfo(context)).toEqual([
      { text: '<input class="StripeField--fake" autocomplete="' },
      { text: 'fake', type: 'strong' },
      { text: '" ...>' },
    ]);
  });

  test('Wraps a string in code with emphasis on the first capture group of a global regular expression', function () {
    const context = shallow(
      <CodeWrap text='<input class="StripeField--fake" autocomplete="fake" ...>' emphasize={/\b(\w+)="([^"]*)"/g} />,
    );
    expect(getCodeInfo(context)).toEqual([
      { text: '<input ' },
      { text: 'class', type: 'strong' },
      { text: '="StripeField--fake" ' },
      { text: 'autocomplete', type: 'strong' },
      { text: '="fake" ...>' },
    ]);
  });

  test('Wraps a string in code with multiple words to emphasize', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize={['world', 'hello']} />);
    expect(getCodeInfo(context)).toEqual([
      { text: 'hello', type: 'strong' },
      { text: ' ' },
      { text: 'world', type: 'strong' },
    ]);
  });

  test('Wraps a string in code with multiple adjacent words to emphasize', function () {
    const context = shallow(<CodeWrap text="helloworld" emphasize={['world', 'hello']} />);
    expect(getCodeInfo(context)).toEqual([{ text: 'helloworld', type: 'strong' }]);
  });

  test('Wraps a string in code with multiple words to emphasize with one word sharing a prefix with another', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize={['hell', 'hello']} />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello', type: 'strong' }, { text: ' world' }]);
  });

  test('Wraps a string in code with multiple words to emphasize with one word sharing a suffix with another', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize={['ello', 'hello']} />);
    expect(getCodeInfo(context)).toEqual([{ text: 'hello', type: 'strong' }, { text: ' world' }]);
  });

  test('Wraps a string in code with multiple words to emphasize with one word sharing a prefix with another, and one being global', function () {
    const context = shallow(<CodeWrap text="hello world, hello, hello, hello" emphasize={[/hell/g, 'hello']} />);
    expect(getCodeInfo(context)).toEqual([
      { text: 'hello', type: 'strong' },
      { text: ' world, ' },
      { text: 'hell', type: 'strong' },
      { text: 'o, ' },
      { text: 'hell', type: 'strong' },
      { text: 'o, ' },
      { text: 'hell', type: 'strong' },
      { text: 'o' },
    ]);
  });

  describe('Attribute highlighting', function () {
    let expression: RegExp;

    beforeEach(() => {
      expression = / (link)((?==)|(?=[^"]*$)|(?![^"]+(?<!=)"))/g;
    });

    test('Wraps an attribute with a value', function () {
      const context = shallow(<CodeWrap text={'<a class="some link here" link="yes">'} emphasize={expression} />);
      expect(getCodeInfo(context)).toEqual([
        { text: '<a class="some link here" ' },
        { text: 'link', type: 'strong' },
        { text: '="yes">' },
      ]);
    });

    test('Wraps an attribute without a value at the end of a tag', function () {
      const context = shallow(<CodeWrap text={'<a class="some link here" link>'} emphasize={expression} />);
      expect(getCodeInfo(context)).toEqual([
        { text: '<a class="some link here" ' },
        { text: 'link', type: 'strong' },
        { text: '>' },
      ]);
    });

    test('Wraps an attribute without a value with ...', function () {
      const context = shallow(<CodeWrap text={'<a class="some link here" link ...>'} emphasize={expression} />);
      expect(getCodeInfo(context)).toEqual([
        { text: '<a class="some link here" ' },
        { text: 'link', type: 'strong' },
        { text: ' ...>' },
      ]);
    });

    test('Wraps an attribute without a value with other attributes trailing', function () {
      const context = shallow(
        <CodeWrap text={'<a class="some link here" link rel="noopener">'} emphasize={expression} />,
      );
      expect(getCodeInfo(context)).toEqual([
        { text: '<a class="some link here" ' },
        { text: 'link', type: 'strong' },
        { text: ' rel="noopener">' },
      ]);
    });
  });
});
