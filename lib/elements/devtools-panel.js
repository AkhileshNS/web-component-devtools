import { css, html, LitElement } from 'lit';
import './views/devtools-action-area.js';
import './views/devtools-elements-list.js';
import './views/devtools-divider.js';
import { MESSAGE_TYPE } from '../types/message-types.js';
import { DevToolsElementList } from './views/devtools-elements-list.js';
import { postMessage } from "../util/messaging.js";

export class DevToolsPanel extends LitElement {
    static get properties() {
        return {
            verticalView: { type: Boolean },
            selectedElement: { type: Object },
            queryResult: { type: Object },
        };
    }

    constructor() {
        super();
        this.selectedElement = null;
        this.queryResult = null;

        const mediaQ = window.matchMedia('(max-width: 1000px)');
        mediaQ.addEventListener('change', mediaQresponse => {
            this.verticalView = mediaQresponse.matches;
        });
        this.verticalView = mediaQ.matches;
    }

    firstUpdated() {
        const elementList = /** @type {DevToolsElementList} */ (this.shadowRoot.querySelector('devtools-elements-list'));
        document.addEventListener(MESSAGE_TYPE.QUERY_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            this.queryResult = event.detail;
            if (this.queryResult.reselectTarget) {
                elementList.doReSelect(this.queryResult.reselectTarget);
            }
        });
        document.addEventListener(MESSAGE_TYPE.SELECT_RESULT.toString(), (/** @type {CustomEvent} */ event) => {
            if (event.detail.data.indexInDevTools === undefined) return;
            this.selectedElement = event.detail.data;
        });
    }

    /**
     * @param {CustomEvent} event
     */
    doSelect(event) {
        const element = event.detail.elem;
        postMessage({
            type: MESSAGE_TYPE.SELECT,
            indexInDevTools: element.index ?? element.indexInDevTools,
            name: element.name,
            tagName: element.name,
        });
    }

    onResize(e) {
        if (this.verticalView) {
            const newFlexPercentage = (100 - (e.detail.y / window.innerHeight) * 100).toFixed(0);
            this.style.setProperty('--action-area-size', newFlexPercentage + '%');
        } else {
            const newFlexPercentage = (100 - (e.detail.x / window.innerWidth) * 100).toFixed(0);
            this.style.setProperty('--action-area-size', newFlexPercentage + '%');
        }
    }

    onExport() {
        const textarea = this.shadowRoot.querySelector("textarea#elements-map-editor");
        textarea.select();
        document.execCommand("copy");
    }

    render() {
        const repeat = (str, n) => {
            let res = "";
            for (let i=0; i<n; i++) {res += str;}
            return res;
        }
        const format = (data) => data.reduce((prev, {name, __WC_DEV_TOOLS_ELEMENT_DEPTH}) => `${prev}\n${repeat("\t", __WC_DEV_TOOLS_ELEMENT_DEPTH)}${name}`, "");

        return html`
            <div style="display: flex; flex-direction: column;">
                <button @click="${this.onExport}">Export</button>
                <textarea id="elements-map-editor" rows="100" style="min-width: 400px; max-width: 400px; background-color: white; color: black;">${format(this.queryResult?.data.elementsArray ?? [])}</textarea>
            </div>
            <devtools-elements-list
                .customElementList=${this.queryResult?.data.elementsArray ?? []}
                .customElementMap=${this.queryResult?.data.elementsMap ?? {}}
                .selectedElement=${this.selectedElement}
                @devtools-element-select=${this.doSelect}
            ></devtools-elements-list>
            <devtools-divider @devtools-resize=${this.onResize}></devtools-divider>
            <devtools-action-area
                    .selectedElement=${this.selectedElement}
            ></devtools-action-area>
        `;
    }

    static get styles() {
        return css`
            :host {
                height: 100%;
                max-height: 100%;
                display: flex;
                flex-direction: row;
                --action-area-size: 50%;
                width: 100%;
            }

            devtools-action-area {
                --area-size: var(--action-area-size);
            }
            @media only screen and (max-width: 1000px) {
                :host {
                    flex-direction: column;
                }
            }
        `;
    }
}

if (!customElements.get('devtools-panel')) {
    customElements.define('devtools-panel', DevToolsPanel);
}
