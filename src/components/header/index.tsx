import { FunctionalComponent, h } from 'preact';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import style from './style.css';
import { useState } from 'preact/hooks';
import { MouseEvent } from 'react';

interface Props {
  documentTree?: TreeNode;
  onLoadTree?: (tree: TreeNode) => void;
}

const Header: FunctionalComponent<Props> = props => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<Element>) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBugReport = () => {
    window.open(
      'https://github.com/GoogleChromeLabs/form-troubleshooter/issues/new?labels=bug&template=bug_report.md',
      '_blank',
    );
    setAnchorEl(null);
  };

  const handleFeatureRequest = () => {
    window.open(
      'https://github.com/GoogleChromeLabs/form-troubleshooter/issues/new?labels=enhancement&template=feature_request.md',
      '_blank',
    );
    setAnchorEl(null);
  };

  const handleFeedback = () => {
    window.open('https://forms.gle/Sm7DbKfLX3hHNcDp9', '_blank');
    setAnchorEl(null);
  };

  async function handleOpenFile() {
    setAnchorEl(null);

    const [fileHandle] = await window.showOpenFilePicker?.({
      types: [
        {
          description: 'JSON',
          accept: {
            'text/*': ['.json'],
          },
        },
      ],
      multiple: false,
    });
    const file = await fileHandle.getFile();
    const contents = await file.text();
    console.log(contents);

    props.onLoadTree?.(JSON.parse(contents));
  }

  async function handleSaveFile() {
    setAnchorEl(null);

    const contents = JSON.stringify(props.documentTree);
    const fileHandle = await window.showSaveFilePicker?.({
      types: [
        {
          description: 'JSON',
          accept: {
            'text/*': ['.json'],
          },
        },
      ],
    });

    let file: FileSystemWritableFileStream | undefined;
    try {
      file = await fileHandle.createWritable();
      await file.write(contents);
    } finally {
      await file?.close();
    }
  }

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
          onClose={handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={handleClose} disabled={true}>
            Share results
          </MenuItem>
          <MenuItem onClick={handleClose} disabled={true}>
            Save as HTML
          </MenuItem>
          <MenuItem onClick={handleBugReport}>File a bug</MenuItem>
          <MenuItem onClick={handleFeatureRequest}>Request a feature</MenuItem>
          <MenuItem onClick={handleFeedback} disabled>
            Provide feedback
          </MenuItem>
          <div class={style.menuDivider}>Development</div>
          <MenuItem title="Open saved tree data and view results" onClick={handleOpenFile}>
            Open form data
          </MenuItem>
          <MenuItem
            title="Save current form to be viewed later"
            onClick={handleSaveFile}
            disabled={!props.documentTree}
          >
            Save form data
          </MenuItem>
        </Menu>
      </nav>
    </header>
  );
};

export default Header;
