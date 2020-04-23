/*
 * @license
 * Copyright (c) 2018 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 *
 * See <a href="https://vaadin.com/license/cval-3">the website</a> for the complete license.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import '@vaadin/vaadin-license-checker/vaadin-license-checker';
import '@vaadin/vaadin-overlay';
import '@polymer/iron-media-query';

class PopupOverlayElement extends OverlayElement {
  static get is() {
    return 'vcf-popup-overlay';
  }
}

customElements.define(PopupOverlayElement.is, PopupOverlayElement);

class VcfPopup extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <vcf-popup-overlay id="popupOverlay" opened="{{opened}}" theme$="[[theme]]" phone$="[[_phone]]"> </vcf-popup-overlay>

      <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"> </iron-media-query>
    `;
  }

  static get is() {
    return 'vcf-popup';
  }

  /**
   * Object describing property-related metadata used by Polymer features
   */
  static get properties() {
    return {
      opened: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      for: {
        type: String
      },

      closeOnClick: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      _targetElement: {
        type: Object
      },

      _phone: Boolean,

      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      }
    };
  }

  /**
   * @protected
   */
  static _finalizeClass() {
    super._finalizeClass();

    const devModeCallback = window.Vaadin.developmentModeCallback;
    const licenseChecker = devModeCallback && devModeCallback['vaadin-license-checker'];
    if (typeof licenseChecker === 'function') {
      licenseChecker(VcfPopup);
    }
  }

  static get observers() {
    return ['_attachToTarget(for)'];
  }

  constructor() {
    super();
    this._boundShow = this.show.bind(this);
    this._boundHide = this.hide.bind(this);
  }

  ready() {
    super.ready();
    this.$.popupOverlay.template = this.querySelector('template');
    if (this.closeOnClick) {
      this.$.popupOverlay.addEventListener('click', this._boundHide);
    }
  }

  connectedCallback() {
    if (!this._targetElement) {
      this._targetElement = this.parentNode.querySelector(`#${this.for}`);
    }
    this._attachToTarget();
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachFromTarget();
    if (this.closeOnClick) {
      this.$.popupOverlay.removeEventListener('click', this._boundHide);
    }
  }

  show() {
    this.opened = true;
    this._setPosition();
  }

  hide() {
    this.opened = false;
  }

  _attachToTarget() {
    if (!this._targetElement) {
      return;
    }
    this._targetElement.addEventListener('click', this._boundShow);
  }

  _detachFromTarget() {
    this._targetElement.removeEventListener('click', this._boundShow);
  }

  _setPosition() {
    const targetBoundingRect = this._targetElement.getBoundingClientRect();
    const overlayRect = this.$.popupOverlay.getBoundingClientRect();
    const positionLeft = targetBoundingRect.left;
    const positionTop = targetBoundingRect.top + targetBoundingRect.height + window.pageYOffset;

    if (positionLeft + overlayRect.width > window.innerWidth) {
      this.$.popupOverlay.style.right = '0px';
      this.$.popupOverlay.style.left = 'auto';
    } else {
      this.$.popupOverlay.style.left = `${Math.max(0, positionLeft)}px`;
      this.$.popupOverlay.style.right = 'auto';
    }

    if (positionTop + overlayRect.height > window.innerHeight + window.pageYOffset) {
      this.$.popupOverlay.style.top = `${positionTop - targetBoundingRect.height - overlayRect.height}px`;
    } else {
      this.$.popupOverlay.style.top = `${positionTop}px`;
    }
  }
}

customElements.define(VcfPopup.is, VcfPopup);

/**
 * @namespace Vaadin
 */
window.Vaadin.VcfPopup = VcfPopup;
