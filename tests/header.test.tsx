/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { h } from 'preact';
import Header from '../src/components/header';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { render } from '@testing-library/preact';

describe('Initial Test of the Header', function () {
  test('Header renders', function () {
    const dom = render(<Header />);
    expect(dom.container.getElementsByTagName('header')[0].textContent).toBe('Form troubleshooter');
  });
});
