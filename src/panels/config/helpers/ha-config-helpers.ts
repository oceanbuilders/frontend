import { mdiPencilOff, mdiPlus } from "@mdi/js";
import "@polymer/paper-tooltip/paper-tooltip";
import { HassEntity, UnsubscribeFunc } from "home-assistant-js-websocket";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { domainIcon } from "../../../common/entity/domain_icon";
import { LocalizeFunc } from "../../../common/translations/localize";
import {
  DataTableColumnContainer,
  RowClickedEvent,
} from "../../../components/data-table/ha-data-table";
import "../../../components/ha-fab";
import "../../../components/ha-icon-overflow-menu";
import "../../../components/ha-icon";
import "../../../components/ha-svg-icon";
import { ConfigEntry, getConfigEntries } from "../../../data/config_entries";
import {
  EntityRegistryEntry,
  subscribeEntityRegistry,
} from "../../../data/entity_registry";
import { domainToName } from "../../../data/integration";
import "../../../layouts/hass-loading-screen";
import "../../../layouts/hass-tabs-subpage-data-table";
import { SubscribeMixin } from "../../../mixins/subscribe-mixin";
import { HomeAssistant, Route } from "../../../types";
import { showEntityEditorDialog } from "../entities/show-dialog-entity-editor";
import { configSections } from "../ha-panel-config";
import { HELPER_DOMAINS } from "./const";
import { showHelperDetailDialog } from "./show-dialog-helper-detail";

// This groups items by a key but only returns last entry per key.
const groupByOne = <T>(
  items: T[],
  keySelector: (item: T) => string
): Record<string, T> => {
  const result: Record<string, T> = {};
  for (const item of items) {
    result[keySelector(item)] = item;
  }
  return result;
};

const getConfigEntry = (
  entityEntries: Record<string, EntityRegistryEntry>,
  configEntries: Record<string, ConfigEntry>,
  entityId: string
) => {
  const configEntryId = entityEntries![entityId]?.config_entry_id;
  return configEntryId ? configEntries![configEntryId] : undefined;
};

@customElement("ha-config-helpers")
export class HaConfigHelpers extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @state() private _stateItems: HassEntity[] = [];

  @state() private _entityEntries?: Record<string, EntityRegistryEntry>;

  @state() private _configEntries?: Record<string, ConfigEntry>;

  private _columns = memoizeOne(
    (narrow: boolean, localize: LocalizeFunc): DataTableColumnContainer => {
      const columns: DataTableColumnContainer = {
        icon: {
          title: "",
          label: localize("ui.panel.config.helpers.picker.headers.icon"),
          type: "icon",
          template: (icon, helper: any) =>
            icon
              ? html` <ha-icon .icon=${icon}></ha-icon> `
              : html`<ha-svg-icon
                  .path=${domainIcon(helper.type)}
                ></ha-svg-icon>`,
        },
        name: {
          title: localize("ui.panel.config.helpers.picker.headers.name"),
          sortable: true,
          filterable: true,
          grows: true,
          direction: "asc",
          template: (name, item: any) =>
            html`
              ${name}
              ${narrow
                ? html` <div class="secondary">${item.entity_id}</div> `
                : ""}
            `,
        },
      };
      if (!narrow) {
        columns.entity_id = {
          title: localize("ui.panel.config.helpers.picker.headers.entity_id"),
          sortable: true,
          filterable: true,
          width: "25%",
        };
      }
      columns.type = {
        title: localize("ui.panel.config.helpers.picker.headers.type"),
        sortable: true,
        width: "25%",
        filterable: true,
        template: (type, row) =>
          row.configEntry
            ? domainToName(localize, type)
            : html`
                ${localize(`ui.panel.config.helpers.types.${type}`) || type}
              `,
      };
      columns.editable = {
        title: "",
        label: this.hass.localize(
          "ui.panel.config.helpers.picker.headers.editable"
        ),
        type: "icon",
        template: (editable) => html`
          ${!editable
            ? html`
                <div
                  tabindex="0"
                  style="display:inline-block; position: relative;"
                >
                  <ha-svg-icon .path=${mdiPencilOff}></ha-svg-icon>
                  <paper-tooltip animation-delay="0" position="left">
                    ${this.hass.localize(
                      "ui.panel.config.entities.picker.status.readonly"
                    )}
                  </paper-tooltip>
                </div>
              `
            : ""}
        `,
      };
      return columns;
    }
  );

  private _getItems = memoizeOne(
    (
      stateItems: HassEntity[],
      entityEntries: Record<string, EntityRegistryEntry>,
      configEntries: Record<string, ConfigEntry>
    ) =>
      stateItems.map((entityState) => {
        const configEntry = getConfigEntry(
          entityEntries,
          configEntries,
          entityState.entity_id
        );

        return {
          id: entityState.entity_id,
          icon: entityState.attributes.icon,
          name: entityState.attributes.friendly_name || "",
          entity_id: entityState.entity_id,
          editable:
            configEntry !== undefined || entityState.attributes.editable,
          type: configEntry
            ? configEntry.domain
            : computeStateDomain(entityState),
          configEntry,
        };
      })
  );

  protected render(): TemplateResult {
    if (
      !this.hass ||
      this._stateItems === undefined ||
      this._entityEntries === undefined ||
      this._configEntries === undefined
    ) {
      return html` <hass-loading-screen></hass-loading-screen> `;
    }

    return html`
      <hass-tabs-subpage-data-table
        .hass=${this.hass}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${configSections.automations}
        .columns=${this._columns(this.narrow, this.hass.localize)}
        .data=${this._getItems(
          this._stateItems,
          this._entityEntries,
          this._configEntries
        )}
        @row-click=${this._openEditDialog}
        hasFab
        clickable
        .noDataText=${this.hass.localize(
          "ui.panel.config.helpers.picker.no_helpers"
        )}
      >
        <ha-fab
          slot="fab"
          .label=${this.hass.localize(
            "ui.panel.config.helpers.picker.add_helper"
          )}
          extended
          @click=${this._createHelpler}
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </hass-tabs-subpage-data-table>
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this._getConfigEntries();
  }

  protected willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);

    if (!this._entityEntries || !this._configEntries) {
      return;
    }

    let changed =
      !this._stateItems ||
      changedProps.has("_entityEntries") ||
      changedProps.has("_configEntries");

    if (!changed && changedProps.has("hass")) {
      const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
      changed = !oldHass || oldHass.states !== this.hass.states;
    }
    if (!changed) {
      return;
    }

    const extraEntities = new Set<string>();

    for (const entityEntry of Object.values(this._entityEntries)) {
      if (
        entityEntry.config_entry_id &&
        entityEntry.config_entry_id in this._configEntries
      ) {
        extraEntities.add(entityEntry.entity_id);
      }
    }

    const newStates = Object.values(this.hass!.states).filter(
      (entity) =>
        extraEntities.has(entity.entity_id) ||
        HELPER_DOMAINS.includes(computeStateDomain(entity))
    );

    if (
      this._stateItems.length !== newStates.length ||
      !this._stateItems.every((val, idx) => newStates[idx] === val)
    ) {
      this._stateItems = newStates;
    }
  }

  public hassSubscribe(): UnsubscribeFunc[] {
    return [
      subscribeEntityRegistry(this.hass.connection!, (entries) => {
        this._entityEntries = groupByOne(entries, (entry) => entry.entity_id);
      }),
    ];
  }

  private async _getConfigEntries() {
    this._configEntries = groupByOne(
      await getConfigEntries(this.hass, { type: "helper" }),
      (entry) => entry.entry_id
    );
  }

  private async _openEditDialog(ev: CustomEvent): Promise<void> {
    const entityId = (ev.detail as RowClickedEvent).id;
    showEntityEditorDialog(this, {
      entity_id: entityId,
    });
  }

  private _createHelpler() {
    showHelperDetailDialog(this, {
      dialogClosedCallback: (params) => {
        if (params.flowFinished) {
          this._getConfigEntries();
        }
      },
    });
  }
}
