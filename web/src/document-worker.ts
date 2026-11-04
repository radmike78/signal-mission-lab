import {wordTextParts} from './document-zip';
self.onmessage=(event:MessageEvent<Uint8Array>)=>{try{self.postMessage({parts:wordTextParts(event.data)});}catch{self.postMessage({error:true});}};
