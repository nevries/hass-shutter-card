class ShutterCard extends HTMLElement {
  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;
    
    //Init the card
    if (!this.card) {
      const card = document.createElement('ha-card');
      
      if (this.config.title) {
          card.header = this.config.title;
      }
    
      this.card = card;
      this.appendChild(card);
    
      let allShutters = document.createElement('div');
      allShutters.className = 'sc-shutters';
      entities.forEach(function(entity) {
        let entityId = entity;
        if (entity && entity.entity) {
            entityId = entity.entity;
        }
        
        let buttonsPosition = 'left';
        if (entity && entity.buttons_position) {
            buttonsPosition = entity.buttons_position.toLowerCase();
            if (!['left', 'top', 'bottom', 'right'].includes(buttonsPosition)) {
              buttonsPosition = 'left'
            }
        }
        const buttonsInRow = buttonsPosition == 'top' || buttonsPosition == 'bottom';
        const buttonsContainerReversed = buttonsPosition == 'bottom' || buttonsPosition == 'right';
        
        let titlePosition = 'top';
        if (entity && entity.title_position) {
            titlePosition = entity.title_position.toLowerCase();
        }

        let invertPercentage = false;
        if (entity && entity.invert_percentage) {
          invertPercentage = entity.invert_percentage;
        }

        let partial = 0;
        if (entity && entity.partial_close_percentage) {
          partial = Math.max(0,Math.min(100,entity.partial_close_percentage)); // make sure this is valid range
        }

        let offset = 0;
        if (entity && entity.offset_closed_percentage) {
          offset = Math.max(0,Math.min(100,entity.offset_closed_percentage)); // make sure this is valid range
        }

        let tilt = false;
        if (entity && entity.can_tilt) {
          tilt = entity.can_tilt;
        }
        
        let width = 153;
        if (entity && entity.shutter_width_px) {
          width = Math.max(10,entity.shutter_width_px); // make sure this is valid range
        }

        let showSlidePercentage = true;
        if (entity && (entity.show_slide_percentage == false)) {
          showSlidePercentage = false;
        }

        let showButtons = true;
        if (entity && (entity.show_buttons == false)) {
          showButtons = false;
        }
          
        let shutter = document.createElement('div');

        shutter.className = 'sc-shutter';
        shutter.dataset.shutter = entityId;
        shutter.innerHTML = `
          <div class="sc-shutter-top" ` + (titlePosition == 'bottom' || titlePosition == 'hide' ? 'style="display:none;"' : '') + `>
            <div class="sc-shutter-label">
            
            </div>
            <div class="sc-shutter-position">
            
            </div>
          </div>
          <div class="sc-shutter-middle" style="flex-flow: ` + (buttonsInRow ? 'column': 'row') + (buttonsContainerReversed ? '-reverse' : '') + ` nowrap;">
            <div class="sc-shutter-buttons" style="flex-flow: ` + (buttonsInRow ? 'row': 'column') + ` wrap;">
              `+(partial?`<ha-icon-button label="Partially close" class="sc-shutter-button sc-shutter-button-partial" data-command="partial" data-position="`+partial+`"><ha-icon icon="mdi:arrow-expand-vertical"></ha-icon></ha-icon-button>`:``)+`
              ` + (tilt?`
              <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.open_tilt_cover`) +`" class="sc-shutter-button sc-shutter-button-tilt-open" data-command="tilt-open"><ha-icon icon="mdi:arrow-top-right"></ha-icon></ha-icon-button>
              <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.close_tilt_cover`) +`"class="sc-shutter-button sc-shutter-button-tilt-down" data-command="tilt-close"><ha-icon icon="mdi:arrow-bottom-left"></ha-icon></ha-icon-button>
              `:``) + `
            </div>` + (showButtons?
            `<div class="sc-shutter-buttons" style="flex-flow: ` + (buttonsInRow ? 'row': 'column') + ` wrap;">
              <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.open_cover`) +`" class="sc-shutter-button sc-shutter-button-up" data-command="up"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button>
              <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.stop_cover`) +`"class="sc-shutter-button sc-shutter-button-stop" data-command="stop"><ha-icon icon="mdi:stop"></ha-icon></ha-icon-button>
              <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.close_cover`) +`" class="sc-shutter-button sc-shutter-button-down" data-command="down"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
            </div>`:``) + 
            `<div class="sc-shutter-selector">
              <div class="sc-shutter-selector-picture" style="width: `+ width +`px">
                <div class="sc-shutter-selector-slide">
                  <div class="sc-shutter-floating-position"></div>
                </div>
                <div class="sc-shutter-selector-picker"></div>`+
                (partial&&!offset?
                  `<div class="sc-shutter-selector-partial" style="top:`+_this.calculatePositionFromPercent(partial, invertPercentage, offset)+`px"></div>`:``
                ) + `
                <div class="sc-shutter-movement-overlay">                
                  <ha-icon class="sc-shutter-movement-open" icon="mdi:arrow-up"></ha-icon>
                  <ha-icon class="sc-shutter-movement-close" icon="mdi:arrow-down"></ha-icon>
                </div>
              </div>
            </div>
          </div>
          <div class="sc-shutter-bottom" ` + (titlePosition != 'bottom' || titlePosition == 'hide' ? 'style="display:none;"' : '') + `>
            <div class="sc-shutter-label">
            
            </div>
            <div class="sc-shutter-position">
            
            </div>
          </div>
        `;
        
        let picture = shutter.querySelector('.sc-shutter-selector-picture');
        let slide = shutter.querySelector('.sc-shutter-selector-slide');
        let picker = shutter.querySelector('.sc-shutter-selector-picker');
        let labels = shutter.querySelectorAll('.sc-shutter-label');
        let floatingPosition = shutter.querySelector('.sc-shutter-floating-position');

        let detailOpen = function(event) {
            let e = new Event('hass-more-info', { composed: true });
            e.detail = {
              entityId
            };
            _this.dispatchEvent(e);
        }

        labels.forEach((labelDOM) => {
            labelDOM.addEventListener('click', detailOpen);
          }
        )        
        
        let initialMouseY = 0;
        let initialPickerPosition = 0;
        
        let mouseDown = function(event) {
            if (event.cancelable) {
              //Disable default drag event
              event.preventDefault();
            }
            
            _this.isUpdating = true;
            
            // Capture initial mouse/touch position
            initialMouseY = event.pageY;
            
            // Capture current picker position
            initialPickerPosition = parseInt(picker.style.top) || _this.minPosition;
            
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('touchmove', mouseMove);
            document.addEventListener('pointermove', mouseMove);
      
            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('touchend', mouseUp);
            document.addEventListener('pointerup', mouseUp);
            
            if (showSlidePercentage) floatingPosition.style.display = 'block';
        };

        const newPercent = function (newPosition) {
          if (newPosition < _this.minPosition)
            newPosition = _this.minPosition;
          
          if (newPosition > _this.maxPosition)
            newPosition = _this.maxPosition;
          
          let percentagePosition = (newPosition - _this.minPosition) * (100-offset) / (_this.maxPosition - _this.minPosition);
          
          if (!invertPercentage) {
            percentagePosition = 100 - percentagePosition;
          } 

          return Math.round(percentagePosition);
        }
  
        let mouseMove = function(event) {
          // Calculate relative movement from initial position
          let deltaY = event.pageY - initialMouseY;
          let newPosition = initialPickerPosition + deltaY;
          
          _this.setPickerPosition(newPosition, picker, slide);
          
          floatingPosition.innerHTML = newPercent(newPosition) + "%";
        };
           
        let mouseUp = function(event) {
          _this.isUpdating = false;
            
          // Calculate final position using relative movement
          let deltaY = event.pageY - initialMouseY;
          let newPosition = initialPickerPosition + deltaY;
          
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('touchmove', mouseMove);
          document.removeEventListener('pointermove', mouseMove);
      
          document.removeEventListener('mouseup', mouseUp);
          document.removeEventListener('touchend', mouseUp);
          document.removeEventListener('pointerup', mouseUp);
          
          if (showSlidePercentage) floatingPosition.style.display = 'none';

          _this.updateShutterPosition(hass, entityId, newPercent(newPosition));
        };
      
        //Manage slider update
        picture.addEventListener('mousedown', mouseDown);
        picture.addEventListener('touchstart', mouseDown);
        picture.addEventListener('pointerdown', mouseDown);
        
        //Manage click on buttons
        shutter.querySelectorAll('.sc-shutter-button').forEach(function (button) {
            button.onclick = function () {
                const command = this.dataset.command;
                
                let service = '';
                let args = ''
                
                switch (command) {
                  case 'up':
                      service = 'open_cover';
                      break;
                      
                  case 'down':
                      service = 'close_cover';
                      break;

                  case 'stop':
                      service = 'stop_cover';
                      break;
                  case 'partial':
                      service = 'set_cover_position';
                      args = {
                        position: this.dataset.position
                      }
                      break;
                  case 'tilt-open':
                    service = 'open_cover_tilt';
                    break;
                  case 'tilt-close':
                    service = 'close_cover_tilt';
                    break;
                  default:
                    return
                }
                
                hass.callService('cover', service, {
                  entity_id: entityId,
                  ...args
                });
            };
        });
      
        allShutters.appendChild(shutter);
      });
      
      
      const style = document.createElement('style');
      style.textContent = `
        .sc-shutters { padding: 16px; }
          .sc-shutter { margin-top: 1rem; overflow: hidden; }
          .sc-shutter:first-child { margin-top: 0; }
          .sc-shutter-middle { display: flex; width: fit-content; max-width: 100%; margin: auto; }
            .sc-shutter-buttons { flex: 1; text-align: center; margin-top: 0.4rem; display: flex; max-width: 100% }
            .sc-shutter-buttons ha-icon-button { display: block; width: min-content }
            .sc-shutter-selector { flex: 1; }
              .sc-shutter-selector-partial { position: absolute; top:0; left: 9px; width: 88%; height: 1px; background-color: gray; }
              .sc-shutter-selector-picture { position: relative; margin: auto; background-size: 100% 100%; min-height: 150px; max-height: 100%; cursor: pointer; }
                .sc-shutter-selector-picture { background-image: url(data:@file/png;base64,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); }
              .sc-shutter-selector-slide { position: absolute; top: 19px; left: 6%; width: 88%; height: 0; }
                .sc-shutter-selector-slide { background-image: url(data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAGCAYAAAACEPQxAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHpPAACA1wAA+5gAAH6BAAB41AAA6bgAADhTAAAa8BY+DIIAAAAoSURBVHjaYjh48OBqpt+/f3sx8fHxcTFJSkoyMHFycjIwcXJyHgYMAKRuB6wLmIXlAAAAAElFTkSuQmCC); }
              .sc-shutter-selector-picker { position: absolute; top: 19px; left: 6%; width: 88%; cursor: pointer; height: 20px; background-repeat: no-repeat; }
                .sc-shutter-selector-picker { background-image: url(data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIkAAAAHCAYAAAA8nm5hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHpPAACA1wAA+5gAAH6BAAB41AAA6bgAADhTAAAa8BY+DIIAAAG4SURBVHja7JYxstowEIZ/rWTJNuPODZyAjipFCq6Qw+RyHILuVXTMQGMzYxwDwpawrVT2MEkeL34UITP+GzXaWUnfr91lm83m+2w2+6qUgnMOQ9W2LYioX0e9rpxzYIzBOQfn3ENeRITD4aCLongTxpgvVVV9q+t6kEkYYwAAzjk8z0NVVf1BRr2eOl5dMTDGPNxLRDDG/DDGKKG1llpr2blqCGTOOeI4BuccdV3jer2ONF64ioRhiCiKYK1FVVWw1vbm+RPbsiyDsiylUEq1vu9jqEkYY7jdbrhcLphMJmCMQSn1btJR/17WWmit++ovhHiXNxFBStlIKVsRBAEFQQDO+aCEnHPsdjusVissFgvM53P4vj+SeFEREdbrNbbbLZbLJabTKdq2fbjfGMOttSTyPLee5xnOeT/Y/G0l2e/3iKIIYRgiy7J+ILrvgaOeaxG/zhSfiWeMoa5rZFmGOI4BAGmaPuwaRISiKMrT6WRFkiRra63oTDLEmWmaAgDyPMfxePztUv/DEHv/+B9BeRbaMyYZkvc+rvv4TdMgz3PEcYwkSdA0zYd8z+ez1lq//QQAAP//AwAV5u5HIxEL5wAAAABJRU5ErkJggg==); }
              .sc-shutter-movement-overlay { 
                position: absolute; top: 19px; left: 6%; width: 88%; height: 118px;
                background-color: rgba(0,0,0,0.3); text-align: center; --mdc-icon-size: 60px
              }
                .sc-shutter-movement-open {display: none}
                .sc-shutter-movement-close {display: none}
          .sc-shutter-top { text-align: center; margin-bottom: 1rem; }
          .sc-shutter-bottom { text-align: center; margin-top: 1rem; }
            .sc-shutter-label { display: inline-block; font-size: 20px; vertical-align: middle; cursor: pointer;}
            .sc-shutter-position { display: inline-block; vertical-align: middle; padding: 0 6px; margin-left: 1rem; border-radius: 2px; background-color: var(--secondary-background-color); }
            .sc-shutter-floating-position { display: none; position: absolute; width: 4ex; margin-left: auto; margin-right: auto; left: 0px; right: 0px; bottom: 0px; border-radius: 2px; background-color: var(--secondary-background-color); text-align: center; }
      `;
    
      this.card.appendChild(allShutters);
      this.appendChild(style);
    }
    
    //Update the shutters UI
    entities.forEach(function(entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }

      let invertPercentage = false;
      if (entity && entity.invert_percentage) {
        invertPercentage = entity.invert_percentage;
      }
        
      let offset = false;
      if (entity && entity.offset_closed_percentage) {
        offset = entity.offset_closed_percentage;
      }
        
      let alwaysPercentage = false;
      if (entity && entity.always_percentage) {
        alwaysPercentage = entity.always_percentage;
      }

      let disableEnd = true;
      if (entity && (entity.always_enable_end_buttons == true)) {
        disableEnd = false;
      }

      const shutter = _this.card.querySelector('div[data-shutter="' + entityId +'"]');
      const slide = shutter.querySelector('.sc-shutter-selector-slide');
      const picker = shutter.querySelector('.sc-shutter-selector-picker');
      const floatingPosition = shutter.querySelector('.sc-shutter-floating-position');
        
      const state = hass.states[entityId];
      const friendlyName = (entity && entity.name) ? entity.name : state ? state.attributes.friendly_name : 'unknown';
      const currentPosition = state ? state.attributes.current_position : 'unknown';
      const movementState = state? state.state : 'unknown';
      const showButtons = (entity && (entity.show_buttons == false)) ? false : true;
      
      shutter.querySelectorAll('.sc-shutter-label').forEach(function(shutterLabel) {
          shutterLabel.innerHTML = friendlyName;
      })
      
      if (!_this.isUpdating) {
        shutter.querySelectorAll('.sc-shutter-position').forEach(function (shutterPosition) {
          let visiblePosition;
          let positionText;
          if (invertPercentage) {
            visiblePosition = offset?Math.min(100, Math.round(currentPosition / offset * 100 )):currentPosition;
            positionText = _this.positionPercentToText(visiblePosition, invertPercentage, alwaysPercentage, hass);
            if (showButtons && disableEnd) {
              _this.changeButtonState(shutter, currentPosition, invertPercentage);
            }
            if (visiblePosition == 100 && offset) {
              positionText += ' ('+ (100-Math.round(Math.abs(currentPosition-visiblePosition)/offset*100)) +' %)';
            }
          }
          else  {
            visiblePosition = offset?Math.max(0, Math.round((currentPosition - offset) / (100-offset) * 100 )):currentPosition;
            positionText = _this.positionPercentToText(visiblePosition, invertPercentage, alwaysPercentage, hass);
            if (showButtons && disableEnd) {
              _this.changeButtonState(shutter, currentPosition, invertPercentage);
            }
            if (visiblePosition == 0 && offset) {
              positionText += ' ('+ (100-Math.round(Math.abs(currentPosition-visiblePosition)/offset*100)) +' %)';
            }
          }
          
          shutterPosition.innerHTML = positionText;
          
        })
        
        floatingPosition.innerHTML = currentPosition + "%";

        _this.setPickerPositionPercentage(currentPosition, picker, slide, invertPercentage, offset);
        

        _this.setMovement(movementState, shutter);
      }
    });
  }

  changeButtonState(shutter, percent, inverted) {
    if (percent == 0) {
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = inverted;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = !inverted;
      });
    }
    else if (percent == 100) {
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = !inverted;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = inverted;
      }) ;     
    }
    else {      
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = false;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = false;
      }) ;
    }
  }

  positionPercentToText(percent, inverted, alwaysPercentage, hass) {
    if (!alwaysPercentage) {
      if (percent == 100) {
        return hass.localize(inverted?'ui.components.logbook.messages.was_closed':'ui.components.logbook.messages.was_opened');
      }
      else if (percent == 0) {
        return hass.localize(inverted?'ui.components.logbook.messages.was_opened':'ui.components.logbook.messages.was_closed');
      }
    }
    return percent + ' %';
  }

  calculatePositionFromPercent(percent, inverted, offset) {
    let visiblePosition;
    if (inverted) {
      visiblePosition = offset?Math.min(100, Math.round(percent / offset * 100 )):percent;
    }
    else  {
      visiblePosition = offset?Math.max(0, Math.round((percent - offset) / (100-offset) * 100 )):percent;
    }
    return (this.maxPosition - this.minPosition) * (inverted?visiblePosition:100-visiblePosition) / 100 + this.minPosition;
  }

  
  getPictureTop(picture) {
      let pictureBox = picture.getBoundingClientRect();
      let body = document.body;
      let docEl = document.documentElement;

      let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;

      let clientTop = docEl.clientTop || body.clientTop || 0;

      let pictureTop  = pictureBox.top + scrollTop - clientTop;
      
      return pictureTop;
  }

  setMovement(movement, shutter) {
    if (movement == "opening" || movement == "closing") {
      let opening = movement == "opening"
      shutter.querySelectorAll(".sc-shutter-movement-overlay").forEach(
        (overlay) => overlay.style.display = "block"
      )
      shutter.querySelectorAll(".sc-shutter-movement-open").forEach(
        (overlay) => overlay.style.display = opening?"block":"none"
      )
      shutter.querySelectorAll(".sc-shutter-movement-close").forEach(
        (overlay) => overlay.style.display = opening?"none":"block"
      )
    }
    else {
      shutter.querySelectorAll(".sc-shutter-movement-overlay").forEach(
        (overlay) => overlay.style.display = "none"
      )
    }
  }
  
  setPickerPositionPercentage(percentage, picker, slide, inverted, offset) {
    let realPosition = this.calculatePositionFromPercent(percentage, inverted, offset);
  
    this.setPickerPosition(realPosition, picker, slide);
  }
  
  setPickerPosition(position, picker, slide) {
    if (position < this.minPosition)
      position = this.minPosition;
  
    if (position > this.maxPosition)
      position = this.maxPosition;
  
    picker.style.top = position + 'px';
    slide.style.height = position - this.minPosition + 'px';
  }
  
  updateShutterPosition(hass, entityId, position) {
    hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: position
    });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    
    this.config = config;
    this.maxPosition = 137;
    this.minPosition = 19;
    this.isUpdating = false;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }
}

customElements.define("shutter-card", ShutterCard);
