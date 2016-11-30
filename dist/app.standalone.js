/**
 * Window decorations and position storage for DuckieTV standalone.
 * Stores window position in localStorage on app close
 * Restores window position when available in localStorage
 * Auto minimizes app when indicated in localStorage
 * Adds event click handlers to the window decoration items in the DOM.
 *
 * Runs outside angular so that the scripts can be kept nicely clean and separated
 */
if (navigator.userAgent.toLowerCase().indexOf('standalone') !== -1) {

    var gui = require('nw.gui');
    var win = gui.Window.get();
    var winState = 'normal';

    if (localStorage.getItem('standalone.position')) {
        var pos = JSON.parse(localStorage.getItem('standalone.position'));
        win.resizeTo(parseInt(pos.width), parseInt(pos.height));
        win.moveTo(parseInt(pos.x), parseInt(pos.y));
        if (pos.state == 'maximized') {
            setTimeout(function() {
                win.maximize();
            }, 150);
        }
    }

    if (localStorage.getItem('standalone.startupMinimized') !== 'Y') {
        setTimeout(function() {
            win.show();
        }, 150);
    }
    window.addEventListener('DOMContentLoaded', function() {

        // add standalone window decorators
        document.body.classList.add('standalone');

        // and handle their events.
        document.getElementById('close').addEventListener('click', function() {
            localStorage.setItem('standalone.position', JSON.stringify({
                width: window.innerWidth,
                height: window.innerHeight,
                x: window.screenX,
                y: window.screenY,
                state: winState 

            }));
            win.close(); // we call window.close so that the close event can fire
        });

        document.getElementById('minimize').addEventListener('click', function() {
            win.minimize();
        });

        var maximize = document.getElementById('maximize'),
            unmaximize = document.getElementById('unmaximize');

        // show/hide maximize/unmaximize button on toggle.
        maximize.addEventListener('click', function() {
            maximize.style.display = 'none';
            unmaximize.style.display = '';
            win.maximize();
            winState = 'maximized';
        });

        unmaximize.addEventListener('click', function() {
            unmaximize.style.display = 'none';
            maximize.style.display = '';
            win.unmaximize();
            winState = 'normal';
        });
    });
};/**
 * nw.js standalone systray
 */
if ((navigator.userAgent.toLowerCase().indexOf('standalone') !== -1)) {
    var tray = null,
        show, calendar, favorites, settings, about, exit;
    var alwaysShowTray = false;
    var gui = require('nw.gui');
    var win = gui.Window.get();
    // Create new empty menu

    // Remakes/Creates the tray as once a tray is removed it needs to be remade.
    var createTray = function() {
        if (tray !== null) {
            tray.remove();
            tray = null;
        }
        tray = new gui.Tray({
            title: navigator.userAgent,
            icon: 'img/logo/icon64.png'
        });
        tray.on('click', function() {
            win.emit('standalone.calendar');
            win.show();
        });

        tray.tooltip = navigator.userAgent;

        var menu = new gui.Menu();
        // Create the menu, only needs to be made once
        // Add a show button
        show = new gui.MenuItem({
            label: "Show DuckieTV",
            click: function() {
                win.show();
                win.emit('restore');
            }
        });
        menu.append(show);

        // Add a calendar button
        calendar = new gui.MenuItem({
            label: "Show Calendar",
            click: function() {
                win.emit('standalone.calendar');
                win.show();
            }
        });
        menu.append(calendar);

        // Add a favorites button
        favorites = new gui.MenuItem({
            label: "Show Favorites",
            click: function() {
                win.emit('standalone.favorites');
                win.show();
            }
        });
        menu.append(favorites);

        // Add a settings button
        settings = new gui.MenuItem({
            label: "Show Settings",
            click: function() {
                win.emit('standalone.settings');
                win.show();
            }
        });
        menu.append(settings);

        // Add a about button
        about = new gui.MenuItem({
            label: "Show About",
            click: function() {
                win.emit('standalone.about');
                win.show();
            }
        });
        menu.append(about);

        // Add a separator
        menu.append(new gui.MenuItem({
            type: 'separator'
        }));

        // Add a exit button
        exit = new gui.MenuItem({
            label: "Exit",
            click: function() {
                win.close(true);
            },
            modifiers: 'cmd-Q',
            key: 'q'
        });
        menu.append(exit);

        tray.menu = menu;

        // Show DuckieTV on Click
        //tray.on('click', function() {
        //    win.show();
        //    win.emit('restore');
        //});
    };

    // If we're always showing the tray, create it now
    if (window.localStorage.getItem('standalone.alwaysShowTray') !== 'N') {
        alwaysShowTray = true;
        createTray();
    }
    if (localStorage.getItem('standalone.startupMinimized') !== 'N') {
        createTray();
    }

    // On Minimize Event
    win.on('minimize', function() {
        // Should we minimize to systray or taskbar?
        if (window.localStorage.getItem('standalone.minimizeSystray') !== 'N') {
            // Hide window
            win.hide();
            // Create a new tray if one isn't already
            if (!alwaysShowTray) {
                createTray();
            }
        }
    });

    // On Restore Event
    win.on('restore', function() {
        // If we're not always showing tray, remove it
        if (tray && !alwaysShowTray) {
            tray.remove();
        }
    });

    // On Close Event, fired before anything happens
    win.on('close', function() {
        if (window.localStorage.getItem('standalone.closeSystray') !== 'N') {
            // Hide window
            win.hide();
            // Create a new tray if one isn't already
            if (!alwaysShowTray) {
                createTray();
            }
        } else {
            win.close(true);
        }
    });


}

// Only fires if force close is false
/* Prototype
    win.on('close', function() {

        win.showDevTools();

        var queryStats = CRUD.stats;

        /**
         * When closing DuckieTV we don't currently check if there is any ongoing database operations
         * It is possible to check as CRUD is global and we can continue to run the db updates in background
         * until finished and then properly close the app.
         * One issue however is that CRUDs 'writesQueued' isn't the correct number, more db operations can
         * be added after it finishes which leaves like 1ms where 'Can close safely' function will fire incorrectly.
         */
/*
        if (queryStats.writesExecuted < queryStats.writesQueued) {
            Object.observe(CRUD.stats, function() {
                queryStats = CRUD.stats;
                if (queryStats.writesExecuted < queryStats.writesQueued) {
                    console.log("Database operations still ongoing!");
                } else {
                    console.log("Can close safely, win.close(true) in console to close");
                }
            });
        } else {
            console.log("We can close safely, win.close(true) in console to close");
        }
    }); */;/**
 * nw.js standalone systray mac hack
 */
if ((navigator.userAgent.toLowerCase().indexOf('standalone') !== -1) && (navigator.platform.toLowerCase().indexOf('mac') !== -1)) {
    console.log("Mac Detected");
    var gui = require('nw.gui');
    // Reference to window and tray
    var win = gui.Window.get();
    var tray;

    // Get the minimize event
    win.on('minimize', function() {
        // should we minimize to systray or taskbar?
        if (window.localStorage.getItem('standalone.minimizeSystray') !== 'N') {
            // Hide window
            win.hide();

            // create empty menu
            var menu = new gui.Menu();

            // Show tray
            tray = new gui.Tray({
                title: navigator.userAgent,
                icon: 'img/logo/icon64.png',
                menu: menu
            });
            // fix for issue https://github.com/nwjs/nw.js/issues/1903
            tray.tooltip = navigator.userAgent;

            // handle tray click
            var trayClick = function() {
                this.remove();
                win.show();
                win.emit('restore');
            }.bind(tray);
            tray.on('click', trayClick);

            // handle exit menu click
            var exitClick = function() {
                this.remove();
                win.close(true);
            }.bind(tray);

            // handle calendar menu click
            var calendarClick = function() {
                win.emit('standalone.calendar');
                trayClick();
            };

            // handle favorites menu click
            var favoritesClick = function() {
                win.emit('standalone.favorites');
                trayClick();
            };

            // handle settings menu click
            var settingsClick = function() {
                win.emit('standalone.settings');
                trayClick();
            };

            // handle about menu click
            var aboutClick = function() {
                win.emit('standalone.about');
                trayClick();
            };

            // add show menu
            var menuShow = new gui.MenuItem({
                label: 'Show DuckieTV'
            });
            menuShow.on('click', trayClick);
            menu.append(menuShow);

            // add calendar menu
            var menuCalendar = new gui.MenuItem({
                label: 'Show Calendar'
            });
            menuCalendar.on('click', calendarClick);
            menu.append(menuCalendar);

            // add favorites menu
            var menuFavorites = new gui.MenuItem({
                label: 'Show Favorites'
            });
            menuFavorites.on('click', favoritesClick);
            menu.append(menuFavorites);

            // add settings menu
            var menuSettings = new gui.MenuItem({
                label: 'Show Settings'
            });
            menuSettings.on('click', settingsClick);
            menu.append(menuSettings);

            // add about menu
            var menuAbout = new gui.MenuItem({
                label: 'Show About'
            });
            menuAbout.on('click', aboutClick);
            menu.append(menuAbout);

            // add a separator to menu
            menu.append(new gui.MenuItem({
                type: 'separator'
            }));

            // Add an exit menu
            var menuExit = new gui.MenuItem({
                label: 'Exit',
                modifiers: 'cmd-Q',
                key: 'q'
            });

            menuExit.on('click', exitClick);
            menu.append(menuExit);

        }
    });

    // get the restore event
    win.on('restore', function() {
        if (window.localStorage.getItem('standalone.minimizeSystray') !== 'N') {
            tray.remove();
        }
    });
};/**
 * Chrome compatible zoom keyboard control implementation for nw.js
 * Zoomlevel is stored in localStorage because this code runs early.
 * Also attaches DevTools F12 key handler
 */
if (navigator.userAgent.toLowerCase().indexOf('standalone') !== -1) {

    var win = require('nw.gui').Window.get(),
        zoomLevels = [25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500],
        zoomIndex = 'standalone.zoomlevel' in localStorage ? parseInt(localStorage.getItem('standalone.zoomlevel')) : 6,
        setZoomLevel = function(index) {
            if (index < 0) {
                index = 0;
            }
            if (index > 15) {
                index = 15;
            }
            zoomIndex = index;
            win.zoomLevel = Math.log(zoomLevels[index] / 100) / Math.log(1.2);
            localStorage.setItem('standalone.zoomlevel', zoomIndex);
        };

    setZoomLevel(zoomIndex);

    // get the zoom command events
    window.addEventListener('keydown', function(event) {

        switch (event.keyCode) {
            case 123: // F12, show inspector
                win.showDevTools();
                break;
            case 187: // +
                if (event.ctrlKey) {
                    setZoomLevel(zoomIndex + 1);
                }
                break;
            case 189: // -
                if (event.ctrlKey) {
                    setZoomLevel(zoomIndex - 1);
                }
                break;
            case 48: // 0
                if (event.ctrlKey) {
                    setZoomLevel(6);
                }
                break;
        }
    });

}