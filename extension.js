/**
 * Created by Julien "delphiki" Villetorte (delphiki@protonmail.com)
 * Modified by Jonathan Hoffmann
 */
const { GObject, St, GLib, Gio, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ByteArray = imports.byteArray;
const Util = imports.misc.util;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let indicator;

const BatteryIndicator = GObject.registerClass(
class BatteryIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Logitech Battery Indicator');

        // Load your SVG icon
        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(Me.path + '/logi.png'),
            style_class: 'system-status-icon',
            icon_size: 16
        });

        this._label = new St.Label({
            text: '?%',
            y_align: Clutter.ActorAlign.CENTER
        });

        // Horizontal box to hold icon and label
        this._box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        this._box.add_child(this._icon);
        this._box.add_child(this._label);

        this.add_child(this._box); // Only add _box once

        this._update();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 600, () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _update() {
        try {
            // Read the battery percentage from the file
            let [success, content] = GLib.file_get_contents('/tmp/logitech_battery_percentage.txt');
            
            if (!success) {
                this._label.set_text('??%');
                return;
            }

            let output = ByteArray.toString(content).trim(); // Ensure there's no trailing whitespace
            
            // Log the output for debugging
            log(`Battery file content: ${output}`);
    
            // If the content is a valid number, update the label
            let match = output.match(/^(\d+)$/); // Match just the number
            if (match) {
                this._label.set_text(`${match[1]}%`); // Append '%' to the number
            } else {
                this._label.set_text('??%');
            }
        } catch (e) {
            log(`Error reading battery file: ${e}`);
            this._label.set_text('Err');
        }
    }

    destroy() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        super.destroy();
    }
});

function init() {}

function enable() {
    indicator = new BatteryIndicator();
    Main.panel.addToStatusArea('logitech-battery', indicator);
    indicator.connect('button-press-event', clickFunction);  // Connect click event here
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}

// Method to handle click events
function clickFunction() {
    Util.spawn(['/usr/bin/solaar'])
    if (indicator) {
        indicator._update();
    }
}