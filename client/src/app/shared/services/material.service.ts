import { ElementRef, OnInit } from '@angular/core';
import { MaterialInstance } from '../types/interfaces';
// Сервис для работы с materialyze.css


// Декларируем переменную "m" и необходимые свойста и методы, что бы избежать ошибок
declare var M: {
  toast: (arg0: { html: string }) => void;
  FloatingActionButton: any;
  init: (arg0: { html: ElementRef }) => void;
  updateTextFields: any;
  Modal: any;
  Tooltip: any;
  Datepicker: any;
  TapTarget: any;
  Tabs: any;
  FormSelect: any;
};




export class MaterialService
{


      // Инициализация динамической кнопки. Принимаем референцию на элемент, типа ElementRef
    static initializeFloatingButton(ref: ElementRef)
    {
       M.FloatingActionButton.init(ref.nativeElement)
    }

    
    static toast(message: string)
    {
        // Метод описан в документации js фреймворка materialyze
        M.toast({html: message})
    }


    

    // Обновляем текстовые инпуты
    static updateTextInputs()
    {
        M.updateTextFields();
    }


    // Инициализируем модальное окно
    static initModalPos(ref: ElementRef): MaterialInstance
    {
        return M.Modal.init(ref.nativeElement,); 
    }

    // Инициализируем модальное окно без закрытия на оверлэй
    static initModalPosNotClickClose(ref: ElementRef): MaterialInstance {
        return M.Modal.init(ref.nativeElement, {
            dismissible: false
        });
    }




    // Инициализируем тултип
    static initToolpip(ref:ElementRef): MaterialInstance
    {
        return M.Tooltip.init(ref.nativeElement);
    }


    // Инициализируем датепикеры
    static initDatepicker(ref:ElementRef, onClose: () => void){
        return M.Datepicker.init(ref.nativeElement,{
            format: 'dd.mm.yyyy',
            showClearBtn: true,
            onClose
        });
    }


    static initTapTarget(ref: ElementRef): MaterialInstance
    {
        return M.TapTarget.init(ref.nativeElement);
    }


    // Инициализируем табы
    static initTabs(ref:ElementRef, options ={}): MaterialInstance
    {
        return M.Tabs.init(ref, options);
    }

    
}



