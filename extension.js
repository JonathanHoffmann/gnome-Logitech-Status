/**
 * Created by Julien "delphiki" Villetorte (delphiki@protonmail.com)
 * Modified by Jonathan Hoffmann
 */
const { GObject, St, GLib, Gio, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ByteArray = imports.byteArray;
const Util = imports.misc.util;

let indicator;

const BatteryIndicator = GObject.registerClass(
class BatteryIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Logitech Battery Indicator');

        this._label = new St.Label({
            text: 'Mouse: ?%',
            y_align: Clutter.ActorAlign.CENTER
        });

        this.add_child(this._label);

        this._update();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 600, () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _update() {
        try {
            // Run solaar show command and capture its output
            let [success, out, err, status] = GLib.spawn_command_line_sync('solaar show');
            
            if (!success) {
                this._label.set_text('Mouse: ??%');
                return;
            }
    
            let output = ByteArray.toString(out);
            
            // Log the output for debugging
            log(`Solaar output: ${output}`);
    
            // Find the first line containing Battery information
            let match = output.match(/Battery:\s+(\d+)%/);
            
            if (match) {
                this._label.set_text(`Mouse: ${match[1]}%`);
            } else {
                this._label.set_text('Mouse: ??%');
            }
        } catch (e) {
            log(`Battery command error: ${e}`);
            this._label.set_text('Mouse: Err');
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
    indicator.connect('button-press-event', clickFunction);
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
}