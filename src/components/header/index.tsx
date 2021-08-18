/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { Fragment, FunctionalComponent, h } from 'preact';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import style from './style.css';
import { useState } from 'preact/hooks';
import { MouseEvent } from 'react';

const isDev = process.env.NODE_ENV !== 'production';

interface Props {
  onSaveHtml?: () => void;
  onOpenJson?: () => void;
}

const Header: FunctionalComponent<Props> = props => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<Element>) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = (callback?: () => void) => {
    setAnchorEl(null);
    callback?.();
  };

  const reportBug = () => {
    window.open(
      'https://github.com/GoogleChromeLabs/form-troubleshooter/issues/new?labels=bug&template=bug_report.md',
      '_blank',
    );
  };

  const requestFeature = () => {
    window.open(
      'https://github.com/GoogleChromeLabs/form-troubleshooter/issues/new?labels=enhancement&template=feature_request.md',
      '_blank',
    );
  };

  const submitFeedback = () => {
    window.open('https://forms.gle/Sm7DbKfLX3hHNcDp9', '_blank');
  };

  return (
    <header class={style.header}>
      <h1>Form troubleshooter</h1>
      <nav class={style.more}>
        <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          className={style.menu}
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={() => {
            handleClose();
          }}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div class={style.menuDivider}>Share</div>
          <MenuItem
            onClick={() => {
              handleClose(props.onSaveHtml);
            }}
            disabled={!props.onSaveHtml}
          >
            Save as HTML
          </MenuItem>
          <MenuItem onClick={() => handleClose()} disabled={true}>
            Share results
          </MenuItem>
          <div class={style.menuDivider}>Feedback</div>
          <MenuItem onClick={() => handleClose(reportBug)}>File a bug</MenuItem>
          <MenuItem onClick={() => handleClose(requestFeature)}>Request a feature</MenuItem>
          <MenuItem onClick={() => handleClose(submitFeedback)}>Provide feedback</MenuItem>
          {isDev ? (
            <Fragment>
              <div class={style.menuDivider}>Development</div>
              <MenuItem
                title="Open saved tree data and view results"
                onClick={() => {
                  handleClose(props.onOpenJson);
                }}
                disabled={!props.onOpenJson}
              >
                Open form data
              </MenuItem>
            </Fragment>
          ) : null}
        </Menu>
      </nav>
    </header>
  );
};

export default Header;
