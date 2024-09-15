/*
 * Copyright 2015-2024 Tomi Leppänen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import Clutter from 'gi://Clutter';
import Glib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';

export default class WifiSignalStrengthMonitorExtension extends Extension {
    enable() {
        this._widget = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._settings = this.getSettings();
        this._timeout = null;
        this._wifi = null;
        let layout = new St.BoxLayout({
            vertical: false,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });
        this._icon = new St.Icon({
            icon_name: 'network-wireless-symbolic',
            style_class: 'system-status-icon'
        });
        layout.add_child(this._icon);
        this._text = new St.Label({text: "N/A"});
        layout.add_child(this._text);
        this._widget.add_child(layout);
        this._widget.connect('button-press-event', () => { this._updateText(); });
        this._setupWifi();
        Main.panel.addToStatusArea(this.uuid, this._widget);
        this._settings.connect('changed', (settings, key) => {
            if (key == 'refresh-time') {
                this._waittime = settings.get_int('refresh-time');
                this._setupTimeout();
            } else if (key == 'mbit-units') {
                this._unit = settings.get_boolean('mbit-units') ? 'Mbit' : 'Mb';
                this._updateText();
            }
        });
        this._waittime = this._settings.get_int('refresh-time');
        this._unit = this._settings.get_boolean('mbit-units') ? 'Mbit' : 'Mb';
    }

    disable() {
        if (this._timeout) {
            Glib.Source.remove(this._timeout);
            this._timeout = null;
        }
        this._widget?.destroy();
        this._widget = null;
    }

    _updateText() {
        let ap = undefined;
        if (!this._wifi || !(ap = this._wifi.get_active_access_point())) {
            this._setupWifi();
            return;
        }
        if (this._wifi && (ap = this._wifi.get_active_access_point())) {
            let bitrate = this._wifi.get_bitrate()/1000;
            let strength = ap.get_strength();
            this._text.text = "%d %%, %d %s/s".format(
                strength,
                bitrate,
                this._unit
            );
        } else {
            this._text.text = "N/A";
        }
    }

    _setupWifi() {
        NM.Client.new_async(null, (obj, result) => {
            let client = NM.Client.new_finish(result);
            let devices = client.get_devices();
            for (let d = 0; d < devices.length; d++) {
                if (devices[d].get_device_type() == NM.DeviceType.WIFI)
                    this._wifi = devices[d];
            }
            this._updateText();
            this._setupTimeout();
        });
    }

    _setupTimeout() {
        if (this._timeout) {
            Glib.Source.remove(this._timeout);
            this._timeout = null;
        }
        if (this._waittime > 0) {
            this._timeout = Glib.timeout_add_seconds(
                Glib.PRIORITY_DEFAULT,
                this._waittime,
                () => { this._updateText(); return true; }
            );
        }
    }
}
