/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw/';

setupRouting();
setupPrecaching(getFiles());
