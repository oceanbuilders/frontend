import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators";
import "../../../../src/components/ha-card";
import {
  UPDATE_SUPPORT_BACKUP,
  UPDATE_SUPPORT_PROGRESS,
  UPDATE_SUPPORT_INSTALL,
} from "../../../../src/data/update";
import "../../../../src/dialogs/more-info/more-info-content";
import { getEntity } from "../../../../src/fake_data/entity";
import {
  MockHomeAssistant,
  provideHass,
} from "../../../../src/fake_data/provide_hass";
import "../../components/demo-more-infos";

const base_attributes = {
  title: "Awesome",
  current_version: "1.2.2",
  latest_version: "1.2.3",
  release_url: "https://home-assistant.io",
  supported_features: UPDATE_SUPPORT_INSTALL,
  skipped_version: null,
  in_progress: false,
  release_summary:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec metus aliquet, porta mi ut, ultrices odio. Etiam egestas orci tellus, non semper metus blandit tincidunt. Praesent elementum turpis vel tempor pharetra. Sed quis cursus diam. Proin sem justo.",
};

const ENTITIES = [
  getEntity("update", "update1", "on", {
    ...base_attributes,
    friendly_name: "Update",
  }),
  getEntity("update", "update2", "on", {
    ...base_attributes,
    title: null,
    friendly_name: "Update without title",
  }),
  getEntity("update", "update3", "on", {
    ...base_attributes,
    release_url: null,
    friendly_name: "Update without release_url",
  }),
  getEntity("update", "update4", "on", {
    ...base_attributes,
    release_summary: null,
    friendly_name: "Update without release_summary",
  }),
  getEntity("update", "update5", "off", {
    ...base_attributes,
    current_version: "1.2.3",
    friendly_name: "No update",
  }),
  getEntity("update", "update6", "off", {
    ...base_attributes,
    skipped_version: "1.2.3",
    friendly_name: "Skipped version",
  }),
  getEntity("update", "update7", "on", {
    ...base_attributes,
    supported_features:
      base_attributes.supported_features + UPDATE_SUPPORT_BACKUP,
    friendly_name: "With backup support",
  }),
  getEntity("update", "update8", "on", {
    ...base_attributes,
    in_progress: true,
    friendly_name: "With true in_progress",
  }),
  getEntity("update", "update9", "on", {
    ...base_attributes,
    in_progress: 25,
    supported_features:
      base_attributes.supported_features + UPDATE_SUPPORT_PROGRESS,
    friendly_name: "With 25 in_progress",
  }),
  getEntity("update", "update10", "on", {
    ...base_attributes,
    in_progress: 50,
    supported_features:
      base_attributes.supported_features + UPDATE_SUPPORT_PROGRESS,
    friendly_name: "With 50 in_progress",
  }),
  getEntity("update", "update11", "on", {
    ...base_attributes,
    in_progress: 75,
    supported_features:
      base_attributes.supported_features + UPDATE_SUPPORT_PROGRESS,
    friendly_name: "With 75 in_progress",
  }),
  getEntity("update", "update12", "unavailable", {
    ...base_attributes,
    in_progress: 50,
    friendly_name: "Unavailable",
  }),
  getEntity("update", "update13", "on", {
    ...base_attributes,
    supported_features: 0,
    friendly_name: "No install support",
  }),
  getEntity("update", "update14", "off", {
    ...base_attributes,
    current_version: null,
    friendly_name: "Update without current_version",
  }),
  getEntity("update", "update15", "off", {
    ...base_attributes,
    latest_version: null,
    friendly_name: "Update without latest_version",
  }),
];

@customElement("demo-more-info-update")
class DemoMoreInfoUpdate extends LitElement {
  @property() public hass!: MockHomeAssistant;

  @query("demo-more-infos") private _demoRoot!: HTMLElement;

  protected render(): TemplateResult {
    return html`
      <demo-more-infos
        .hass=${this.hass}
        .entities=${ENTITIES.map((ent) => ent.entityId)}
      ></demo-more-infos>
    `;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    const hass = provideHass(this._demoRoot);
    hass.updateTranslations(null, "en");
    hass.addEntities(ENTITIES);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-more-info-update": DemoMoreInfoUpdate;
  }
}
