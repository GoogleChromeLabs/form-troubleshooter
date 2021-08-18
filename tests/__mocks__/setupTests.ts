/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import 'regenerator-runtime/runtime';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({
  adapter: new Adapter(),
});
