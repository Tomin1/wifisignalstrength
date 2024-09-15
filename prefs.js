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

import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WifiSignalMonitorPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    getPreferencesWidget() {
        return new Gtk.Label({ label: this.metadata.name })
    }

    fillPreferencesWindow(window) {
        window._settings = this.getSettings();
        const page = new Adw.PreferencesPage({
            title: this.metadata.name,
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);
        const adjustment = new Gtk.Adjustment({
            lower: 0,
            upper: 60,
            step_increment: 1,
        });
        window._settings.bind('refresh-time', adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        const group = new Adw.PreferencesGroup({
            title: _('Basic'),
        });
        page.add(group);
        const refreshRow = new Adw.SpinRow({
            title: _("Refresh every (seconds)"),
            adjustment: adjustment,
        });
        group.add(refreshRow);
        const abbreviationRow = new Adw.SwitchRow({
            title: _("Use Mbit as unit instead of Mb"),
            subtitle: _("Change displayed unit abbreviation")
        });
        window._settings.bind('mbit-units', abbreviationRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(abbreviationRow);
    }
}
