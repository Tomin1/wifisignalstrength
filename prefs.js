/*
 * Copyright 2015-2017 Tomi Leppänen
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

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const WifiSignalMonitorPrefsWidget = new Lang.Class({
    Name: 'WifiSignalMonitorPrefsWidget',
    Extends: Gtk.Box,

    _init: function() {
        this.parent({ orientation: Gtk.Orientation.VERTICAL,
                      border_width: 10,
                      margin: 20 });
        this.add(new Gtk.Label({ label: "Refresh every (seconds)" }));
        let refreshTime = Gtk.SpinButton.new_with_range(1, 60, 1);
        this.add(refreshTime);
        this._schema = Convenience.getSettings();
        this._schema.bind('refresh-time', refreshTime, 'value',
                          Gio.SettingsBindFlags.DEFAULT);
    }
});

function init() {
}

function buildPrefsWidget() {
    let widget = new WifiSignalMonitorPrefsWidget();
    widget.show_all();
    return widget;
}
