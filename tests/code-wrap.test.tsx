import { h } from 'preact';
import CodeWrap from '../src/components/code-wrap';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow } from 'enzyme';

describe('CodeWrap', function () {
  test('Wraps a string in code', function () {
    const context = shallow(<CodeWrap text="hello" />);
    expect(context.find('code').text()).toBe('hello');
  });

  test('Wraps a string in code when text not found', function () {
    const context = shallow(<CodeWrap text="hello" emphasize="boo" />);
    expect(context.find('code').text()).toBe('hello');
  });

  test('Wraps a string in code with emphasis (beginning of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="hello" />);
    expect(context.find('code').at(0).text()).toBe('hello');
    expect(context.find('code').at(1).text()).toBe(' world');
  });

  test('Wraps a string in code with emphasis (middle of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="lo wo" />);
    expect(context.find('code').at(0).text()).toBe('hel');
    expect(context.find('code').at(1).text()).toBe('lo wo');
    expect(context.find('code').at(2).text()).toBe('rld');
  });

  test('Wraps a string in code with emphasis (end of text)', function () {
    const context = shallow(<CodeWrap text="hello world" emphasize="world" />);
    expect(context.find('code').at(0).text()).toBe('hello ');
    expect(context.find('code').at(1).text()).toBe('world');
  });

  test('Wraps a string in code with emphasis on first instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize="hello" emphasizeAll={false} />);
    expect(context.find('code').at(0).text()).toBe('hello');
    expect(context.find('code').at(1).text()).toBe(' world hello hello');
  });

  test('Wraps a string in code with emphasis on all instances', function () {
    const context = shallow(<CodeWrap text="hello world hello hello" emphasize="hello" emphasizeAll={true} />);
    expect(context.find('code').at(0).text()).toBe('hello');
    expect(context.find('code').at(1).text()).toBe(' world ');
    expect(context.find('code').at(2).text()).toBe('hello');
    expect(context.find('code').at(3).text()).toBe(' ');
    expect(context.find('code').at(4).text()).toBe('hello');
  });
});
