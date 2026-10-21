import {Capacitor} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {createPracticeStore} from './practice-store';
export const nativeApp=Capacitor.isNativePlatform();
export const nativePlatform=Capacitor.getPlatform();
const key='sml-practice-v1';
export const practiceStore=createPracticeStore({
 get:async()=>nativeApp?(await Preferences.get({key})).value:localStorage.getItem(key),
 set:async value=>{if(nativeApp)await Preferences.set({key,value});else localStorage.setItem(key,value);},
 remove:async()=>{if(nativeApp)await Preferences.remove({key});else localStorage.removeItem(key);}
});
