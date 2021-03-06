var ngIntroDirective = angular.module('angular-intro-plus', []);

/**
 * TODO: Use isolate scope, but requires angular 1.2: http://plnkr.co/edit/a2c14O?p=preview
 * See: http://stackoverflow.com/q/18796023/237209
 */

ngIntroDirective.directive('ngIntroPlusOptions', ['$timeout', '$parse', function ($timeout, $parse) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            // define variables
            var elPlusOverlay, aelChildHelpIcons, oIntro, htOptions, lastHiddenHelpIconsIndex;

            // define variables of methods
            var createOverlay, removeOverlay, createChildHelpIcons, removeChildHelpIcons, showChildHelpIcons,
                hideChildHelpIcon, showIntro, startIntroPlus, exitIntro;

            // bootstrap
            elPlusOverlay = false;
            aelChildHelpIcons = [];
            oIntro = false;
            htOptions = {};

            /**
             * create overlay
             */
            createOverlay = function () {
                if (attrs.ngIntroPlusOnBeforeOverlayCreation) {
                    scope.$eval(attrs.ngIntroPlusOnBeforeOverlayCreation)(scope);
                }
                elPlusOverlay = $('<div class="introjs-plus-overlay" style="position:fixed;top:0;right:0;bottom:0;left:0;"/>');
                elPlusOverlay.bind('click', function () {
                    removeOverlay();
                    removeChildHelpIcons();
                });

                var onKeyDown = function (event) {
                    var KEYCODE_ESC = 27;
                    if (elPlusOverlay && event.which === KEYCODE_ESC) {
                        exitIntro();
                        removeOverlay();
                        removeChildHelpIcons();
                    }
                };

                $(document).keydown(onKeyDown);

                elPlusOverlay.on('remove', function () {
                    $(document).unbind('keydown',  onKeyDown);
                });

                elPlusOverlay.appendTo('body');
                lastHiddenHelpIconsIndex = false;
                setTimeout(function() {
                    elPlusOverlay.css('opacity', 0.8);

                    if (attrs.ngIntroPlusOnAfterOverlayCreation) {
                        scope.$eval(attrs.ngIntroPlusOnAfterOverlayCreation)(scope);
                    }
                    createChildHelpIcons();
                }, 10);
            };

            /**
             * remove overlay
             */
            removeOverlay = function () {
                if (attrs.ngIntroPlusOnBeforeOverlayRemoval) {
                    scope.$eval(attrs.ngIntroPlusOnBeforeOverlayRemoval)(scope);
                }
                elPlusOverlay.css('opacity', 0);
                setTimeout(function () {
                    elPlusOverlay.remove();
                    elPlusOverlay = false;

                    if (attrs.ngIntroPlusOnAfterOverlayRemoval) {
                        scope.$eval(attrs.ngIntroPlusOnAfterOverlayRemoval)(scope);
                    }
                }, 500);
            };

            /**
             * create child help icons
             */
            createChildHelpIcons = function () {
                aelChildHelpIcons = [];
                angular.forEach(htOptions.steps, function (currentItem, i) {

                    var el = $(currentItem.element),
                        offset = el.offset(),
                        width = el.width(),
                        height = el.height(),
                        newEl = $(htOptions.helpIcons || '<span class="glyphicon glyphicon-question-sign" style="position:absolute;color:#fff;font-size:24px;z-index:1000000;cursor:pointer;"></span>');

                    // @todo might be changed this to isVisible module
                    if (el.css('display') === 'none' ||
                        (offset.top === 0 && offset.left === 0) ||
                        width < 1 || height < 1) {
                        aelChildHelpIcons.push(false);
                        return;
                    }
                    newEl.appendTo('body');
                    newEl.addClass('introjs-plus-help-icon');
                    newEl.css('top', offset.top + (height/2 - newEl.height()/2) + 'px');
                    newEl.css('left', offset.left + (width/2 - newEl.width()/2) + 'px');
                    if (lastHiddenHelpIconsIndex === i) {
                        newEl.hide();
                    }
                    var displayIntro = function () {
                        showChildHelpIcons();
                        setTimeout(function () {
                            hideChildHelpIcon(i);
                            showIntro(i+1);
                        }, 10);
                    };
                    if (htOptions.hover) {
                        newEl.hover(displayIntro);
                    } else {
                        newEl.bind('click', displayIntro);
                    }
                    aelChildHelpIcons.push(newEl);
                });
            };

            /**
             * remove child help icons
             */
            removeChildHelpIcons = function () {
//                for(var k in aelChildHelpIcons) {
//                    if (aelChildHelpIcons[k]) {
//                        aelChildHelpIcons[k].remove();
//                    }
//                }
                $('.introjs-plus-help-icon').remove();
            };

            /**
             * show child help icons
             */
            showChildHelpIcons = function () {
                for(var k in aelChildHelpIcons) {
                    if (aelChildHelpIcons[k]) {
                        aelChildHelpIcons[k].show();
                    }
                }
            };

            /**
             * hide child help icon
             * @param i
             */
            hideChildHelpIcon = function (i) {
                if (aelChildHelpIcons[i]) {
                    lastHiddenHelpIconsIndex = i;
                    aelChildHelpIcons[i].hide();
                }
            };

            /**
             * show intro
             * @param step
             */
            showIntro = function (step) {
                if (!oIntro) {
                    oIntro = introJs();

                    oIntro.setOptions(htOptions);

                    if(attrs.ngIntroOncomplete) {
                        oIntro.oncomplete($parse(attrs.ngIntroPlusOncomplete)(scope));
                    }

                    oIntro.onexit(function () {
                        showChildHelpIcons();
                        exitIntro();
                        if(attrs.ngIntroPlusOnExit) {
                            scope.$eval(attrs.ngIntroPlusOnExit)(scope);
                        }
                    });

                    if(attrs.ngIntroPlusOnChange) {
                        oIntro.onchange($parse(attrs.ngIntroPlusOnChange)(scope));
                    }

                    if(attrs.ngIntroPlusOnBeforeChange) {
                        oIntro.onbeforechange($parse(attrs.ngIntroPlusOnBeforeChange)(scope));
                    }

                    if(attrs.ngIntroPlusOnAfterChange) {
                        oIntro.onafterchange($parse(attrs.ngIntroPlusOnAfterChange)(scope));
                    }

                    if(typeof(step) === 'number') {
                        oIntro.goToStep(step);
                    }
                    oIntro.start();

                } else {
                    oIntro.goToStep(step);
                }
            };

            /**
             * start intro plus
             */
            startIntroPlus = function () {
                var inputOptions = scope.$eval(attrs.ngIntroPlusOptions);
                htOptions = {
                    showStepNumbers: false,
                    exitOnOverlayClick: true,
                    exitOnEsc: true,
                    showButtons: false,
                    keyboardNavigation: false,
                    showBullets: false,
                    overlayOpacity: 0,
                    steps : inputOptions.steps,
                    helpIcons : inputOptions.helpIcons,
                    hover: inputOptions.hover
                };

                if (!elPlusOverlay) {
                    createOverlay();
                } else {
                    removeOverlay();
                }
            };

            /**
             * exit intro
             */
            exitIntro = function () {
                if (oIntro) {
                    oIntro.exit();
                    oIntro = false;
                    // remove elements of intro.js immediately, because it makes delay 500ms that interrupt click event
                    $('.introjs-overlay').remove();
                    $('.introjs-helperLayer').remove();
                }
            };

            /**
             * ng intro plus show
             */
            scope[attrs.ngIntroPlusShow] = function() {
                startIntroPlus();
            };

            /**
             * ng intro plus hide
             */
            scope[attrs.ngIntroPlusHide] = function () {
                if (elPlusOverlay) {
                    exitIntro();
                    removeChildHelpIcons();
                    removeOverlay();
                }
            };

            /**
             * ng intro plus hide help box
             */
            scope[attrs.ngIntroPlusHideHelpBox] = function () {
                if (elPlusOverlay) {
                    exitIntro();
                    showChildHelpIcons();
                }
            };

            /**
             * ng intro plus refresh help icons
             */
            scope[attrs.ngIntroPlusRefreshHelpIcons] = function () {
                if (elPlusOverlay) {
                    $timeout(function () {
                        removeChildHelpIcons();
                        createChildHelpIcons();
                    });
                }
            };

            // autostart
            if(attrs.ngIntroAutostart == 'true') {
                $timeout(function() {
                    $parse(attrs.ngIntroPlusShow)(scope)();
                });
            }
        }
    };
}]);
