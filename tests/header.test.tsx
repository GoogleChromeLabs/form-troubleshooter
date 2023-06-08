/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { h } from 'preact';
import Header from '../src/components/header';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow } from 'enzyme';
import React from 'react';

describe('Initial Test of the Header', function () {
  test('Header renders', function () {
    const context = shallow(React.createElement('div', {}, <Header />));
    expect(context.find('h1').text()).toBe('Form troubleshooter');
  });
});
