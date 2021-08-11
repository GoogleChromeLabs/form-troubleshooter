import { Component, createRef, h } from 'preact';
import { generateHtmlString } from '../../lib/save-html';
import { truncate } from '../../lib/string-util';
import Results from '../../routes/results';
import AuditSummary from '../summary';
import style from './style.css';
import { version } from '../../../package.json';
import { getBareTreeNode, getPath } from '../../lib/tree-util';
import { waitFor } from '../../lib/wait-util';

interface Props {
  title: string;
  auditUrl: string;
  auditResults: AuditDetails;
  tree: TreeNode | undefined;
  icon?: string;
}

export default class Report extends Component<Props> {
  private reportElement = createRef<HTMLDivElement>();
  private errorsReady = false;
  private warningsReady = false;

  public async getHtml(): Promise<string> {
    if (this.props.tree) {
      await waitFor(
        () => {
          return this.reportElement.current && this.errorsReady && this.warningsReady;
        },
        2000,
        100,
      );
      const html = await generateHtmlString([this.reportElement.current!], {
        version,
        auditResults: {
          score: this.props.auditResults.score * 100,
          errors: this.props.auditResults.errors.map(result => ({
            ...result,
            items: result.items.map(item => ({ ...getBareTreeNode(item, false), path: getPath(item) })),
          })),
          warnings: this.props.auditResults.warnings.map(result => ({
            ...result,
            items: result.items.map(item => ({ ...getBareTreeNode(item, false), path: getPath(item) })),
          })),
        },
        tree: this.props.tree,
      });
      return html;
    }
    return '';
  }

  render(): JSX.Element {
    const { auditResults, auditUrl, title, icon } = this.props;

    return (
      <div ref={this.reportElement} class={style.report}>
        <div class={style.title}>
          {icon ? <img class={style.icon} src={icon} alt="Webpage icon" /> : null}
          <div>
            <h1>{title}</h1>
            <p class={style.url}>{truncate(auditUrl, 100)}</p>
          </div>
        </div>
        <AuditSummary
          className={style.reportScore}
          score={auditResults.score}
          recommendations={auditResults.errors}
          commonMistakes={auditResults.warnings}
        />
        <h2>Recommendations</h2>
        <div class={style.results}>
          <Results
            results={auditResults.errors}
            onRender={() => {
              this.errorsReady = true;
            }}
          />
        </div>
        <h2>Common mistakes</h2>
        <div class={style.results}>
          <Results
            results={auditResults.warnings}
            onRender={() => {
              this.warningsReady = true;
            }}
          />
        </div>
      </div>
    );
  }
}
