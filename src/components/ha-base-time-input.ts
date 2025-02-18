import "@material/mwc-list/mwc-list-item";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../common/dom/fire_event";
import { stopPropagation } from "../common/dom/stop_propagation";
import "./ha-select";
import "./ha-textfield";

export interface TimeChangedEvent {
  days?: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  amPm?: "AM" | "PM";
}

@customElement("ha-base-time-input")
export class HaBaseTimeInput extends LitElement {
  /**
   * Label for the input
   */
  @property() label?: string;

  /**
   * Helper for the input
   */
  @property() helper?: string;

  /**
   * auto validate time inputs
   */
  @property({ type: Boolean }) autoValidate = false;

  /**
   * determines if inputs are required
   */
  @property({ type: Boolean }) public required?: boolean;

  /**
   * 12 or 24 hr format
   */
  @property({ type: Number }) format: 12 | 24 = 12;

  /**
   * disables the inputs
   */
  @property({ type: Boolean }) disabled = false;

  /**
   * day
   */
  @property({ type: Number }) days = 0;

  /**
   * hour
   */
  @property({ type: Number }) hours = 0;

  /**
   * minute
   */
  @property({ type: Number }) minutes = 0;

  /**
   * second
   */
  @property({ type: Number }) seconds = 0;

  /**
   * milli second
   */
  @property({ type: Number }) milliseconds = 0;

  /**
   * Label for the day input
   */
  @property() dayLabel = "";

  /**
   * Label for the hour input
   */
  @property() hourLabel = "";

  /**
   * Label for the min input
   */
  @property() minLabel = "";

  /**
   * Label for the sec input
   */
  @property() secLabel = "";

  /**
   * Label for the milli sec input
   */
  @property() millisecLabel = "";

  /**
   * show the sec field
   */
  @property({ type: Boolean }) enableSecond = false;

  /**
   * show the milli sec field
   */
  @property({ type: Boolean }) enableMillisecond = false;

  /**
   * show the day field
   */
  @property({ type: Boolean }) enableDay = false;

  /**
   * limit hours input
   */
  @property({ type: Boolean }) noHoursLimit = false;

  /**
   * AM or PM
   */
  @property() amPm: "AM" | "PM" = "AM";

  /**
   * Formatted time string
   */
  @property() value?: string;

  protected render(): TemplateResult {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}
      <div class="time-input-wrap">
        ${this.enableDay
          ? html`
              <ha-textfield
                id="day"
                type="number"
                inputmode="numeric"
                .value=${this.days}
                .label=${this.dayLabel}
                name="days"
                @input=${this._valueChanged}
                @focus=${this._onFocus}
                no-spinner
                .required=${this.required}
                .autoValidate=${this.autoValidate}
                min="0"
                .disabled=${this.disabled}
                suffix=":"
                class="hasSuffix"
              >
              </ha-textfield>
            `
          : ""}

        <ha-textfield
          id="hour"
          type="number"
          inputmode="numeric"
          .value=${this.hours}
          .label=${this.hourLabel}
          name="hours"
          @input=${this._valueChanged}
          @focus=${this._onFocus}
          no-spinner
          .required=${this.required}
          .autoValidate=${this.autoValidate}
          maxlength="2"
          .max=${this._hourMax}
          min="0"
          .disabled=${this.disabled}
          suffix=":"
          class="hasSuffix"
        >
        </ha-textfield>
        <ha-textfield
          id="min"
          type="number"
          inputmode="numeric"
          .value=${this._formatValue(this.minutes)}
          .label=${this.minLabel}
          @input=${this._valueChanged}
          @focus=${this._onFocus}
          name="minutes"
          no-spinner
          .required=${this.required}
          .autoValidate=${this.autoValidate}
          maxlength="2"
          max="59"
          min="0"
          .disabled=${this.disabled}
          .suffix=${this.enableSecond ? ":" : ""}
          class=${this.enableSecond ? "has-suffix" : ""}
        >
        </ha-textfield>
        ${this.enableSecond
          ? html`<ha-textfield
              id="sec"
              type="number"
              inputmode="numeric"
              .value=${this._formatValue(this.seconds)}
              .label=${this.secLabel}
              @input=${this._valueChanged}
              @focus=${this._onFocus}
              name="seconds"
              no-spinner
              .required=${this.required}
              .autoValidate=${this.autoValidate}
              maxlength="2"
              max="59"
              min="0"
              .disabled=${this.disabled}
              .suffix=${this.enableMillisecond ? ":" : ""}
              class=${this.enableMillisecond ? "has-suffix" : ""}
            >
            </ha-textfield>`
          : ""}
        ${this.enableMillisecond
          ? html`<ha-textfield
              id="millisec"
              type="number"
              .value=${this._formatValue(this.milliseconds, 3)}
              .label=${this.millisecLabel}
              @input=${this._valueChanged}
              @focus=${this._onFocus}
              name="milliseconds"
              no-spinner
              .required=${this.required}
              .autoValidate=${this.autoValidate}
              maxlength="3"
              max="999"
              min="0"
              .disabled=${this.disabled}
            >
            </ha-textfield>`
          : ""}
        ${this.format === 24
          ? ""
          : html`<ha-select
              .required=${this.required}
              .value=${this.amPm}
              .disabled=${this.disabled}
              name="amPm"
              naturalMenuWidth
              fixedMenuPosition
              @selected=${this._valueChanged}
              @closed=${stopPropagation}
            >
              <mwc-list-item value="AM">AM</mwc-list-item>
              <mwc-list-item value="PM">PM</mwc-list-item>
            </ha-select>`}
      </div>
      ${this.helper ? html`<div class="helper">${this.helper}</div>` : ""}
    `;
  }

  private _valueChanged(ev) {
    this[ev.target.name] =
      ev.target.name === "amPm" ? ev.target.value : Number(ev.target.value);
    const value: TimeChangedEvent = {
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
    };
    if (this.format === 12) {
      value.amPm = this.amPm;
    }
    fireEvent(this, "value-changed", {
      value,
    });
  }

  private _onFocus(ev) {
    ev.target.select();
  }

  /**
   * Format time fragments
   */
  private _formatValue(value: number, padding = 2) {
    return value.toString().padStart(padding, "0");
  }

  /**
   * 24 hour format has a max hr of 23
   */
  private get _hourMax() {
    if (this.noHoursLimit) {
      return null;
    }
    if (this.format === 12) {
      return 12;
    }
    return 23;
  }

  static styles = css`
    :host {
      display: block;
    }
    .time-input-wrap {
      display: flex;
      border-radius: var(--mdc-shape-small, 4px) var(--mdc-shape-small, 4px) 0 0;
      overflow: hidden;
      position: relative;
    }
    ha-textfield {
      width: 40px;
      text-align: center;
      --mdc-shape-small: 0;
      --text-field-appearance: none;
      --text-field-padding: 0 4px;
      --text-field-suffix-padding-left: 2px;
      --text-field-suffix-padding-right: 0;
      --text-field-text-align: center;
    }
    ha-textfield.hasSuffix {
      --text-field-padding: 0 0 0 4px;
    }
    ha-textfield:first-child {
      --text-field-border-top-left-radius: var(--mdc-shape-medium);
    }
    ha-textfield:last-child {
      --text-field-border-top-right-radius: var(--mdc-shape-medium);
    }
    ha-select {
      --mdc-shape-small: 0;
      width: 85px;
    }
    label {
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      font-family: var(
        --mdc-typography-body2-font-family,
        var(--mdc-typography-font-family, Roboto, sans-serif)
      );
      font-size: var(--mdc-typography-body2-font-size, 0.875rem);
      line-height: var(--mdc-typography-body2-line-height, 1.25rem);
      font-weight: var(--mdc-typography-body2-font-weight, 400);
      letter-spacing: var(
        --mdc-typography-body2-letter-spacing,
        0.0178571429em
      );
      text-decoration: var(--mdc-typography-body2-text-decoration, inherit);
      text-transform: var(--mdc-typography-body2-text-transform, inherit);
      color: var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));
      padding-left: 4px;
    }

    .helper {
      color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
      font-size: 0.75rem;
      padding-left: 16px;
      padding-right: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-base-time-input": HaBaseTimeInput;
  }
}
