import { css, html, LitElement } from 'lit';
import {
    renderBooleanProperty,
    renderNumberProperty,
    renderObjectProperty,
    renderStringProperty,
} from '../util/property-editor-builder';

export class DevtoolsObjectInput extends LitElement {
    static get properties() {
        return {
            object: { type: Object },
            property: { type: Object },
            propName: { type: String },
            objectPropertyTemplate: { type: Object },
            propertyPath: { type: Array },
            hasBeenOpened: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.object = {};
        this.property = {};
        this.propName = '';
        this.objectPropertyTemplate = html``;
        this.propertyPath = [];
        this.hasBeenOpened = false;
    }

    updated(_changedProperties) {
        if (this.hasBeenOpened && _changedProperties.has("object")) {
            this.objectPropertyTemplate = this.getObjectProperties();
        }
    }

    _onToggle(e) {
        if (e.target.open) {
            this.objectPropertyTemplate = this.getObjectProperties();
            this.hasBeenOpened = true;
        }
    }

    _getObjectPreview() {
        let objectPreview = JSON.stringify(this.object);
        if (objectPreview.length > 40) objectPreview = objectPreview.substring(0, 40) + '...';
        return objectPreview;
    }

    render() {
        return html`
            <details @toggle=${this._onToggle}>
                <summary>
                    <span
                        ><label>${this.propName}:</label
                        ><label class="preview">${this._getObjectPreview()}</label></span
                    >
                </summary>
                ${this.objectPropertyTemplate}
            </details>
        `;
    }

    getObjectProperties() {
        if (typeof this.object === 'object' && Object.keys(this.object).length <= 0) {
            return html`<label class="no-length-indicator">${Array.isArray(this.object) ? '[]' : '{}'}</label>`;
        }
        return html` ${Object.keys(this.object).map(key => this.renderProperty({ name: key }))}`;
    }

    renderProperty(prop) {
        let propName = prop.name.startsWith('__') ? prop.name.substring(2) : prop.name;
        propName = propName.substring(0, 1).toUpperCase() + propName.substring(1);
        const value = this.object ? this.object[prop.name] ?? '' : '';
        const type = typeof value ?? 'string';
        prop.type = { text: type };
        switch (type) {
            case 'boolean':
                return renderBooleanProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    propertyPath: [...this.propertyPath, this.property.name],
                });
            case 'number':
                return renderNumberProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    propertyPath: [...this.propertyPath, this.property.name],
                });
            // @ts-ignore
            case 'array':
            case 'object':
                return renderObjectProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    propertyPath: [...this.propertyPath, this.property.name],
                });
            default:
                return renderStringProperty({
                    property: prop,
                    propertyName: propName,
                    value: value,
                    propertyPath: [...this.propertyPath, this.property.name],
                });
        }
    }

    static get styles() {
        return css`
            :host {
                --font-size: 0.8rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }

            summary {
                margin-left: -0.85rem;
                width: 100%;
                cursor: pointer;
                user-select: none;
            }
            summary > span {
                display: inline;
                width: 100%;
                box-sizing: border-box;
                pointer-events: none;
            }

            details {
                display: flex;
                width: 100%;
                padding-left: 0.8rem;
            }

            details[open] {
                padding-bottom: 1rem;
            }

            .param-function-caller {
                margin: 0 0 0 1rem;
            }

            label {
                font-size: 0.8rem;
                padding: 0 1rem 0 3px;
                color: var(--secondary);
                font-weight: 400;
                white-space: nowrap;
                vertical-align: middle;
            }

            .preview {
                font-size: 0.65rem;
                color: var(--highlight);
            }

            .no-length-indicator {
                color: var(--highlight);
            }

            .param-list {
                display: flex;
                flex-direction: column;
                padding: 0 0 0 1rem;
            }
        `;
    }
}

if (!customElements.get('devtools-object-input')) {
    customElements.define('devtools-object-input', DevtoolsObjectInput);
}