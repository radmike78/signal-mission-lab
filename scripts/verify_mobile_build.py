"""Inspect compiled release metadata; this does not replace device testing."""
import json
import plistlib
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if sys.argv[1]=='android':
    manifests=list((ROOT/'web/android/app/build/intermediates/merged_manifests/release').rglob('AndroidManifest.xml'))
    assert manifests,'Missing merged release manifest'
    ns='{http://schemas.android.com/apk/res/android}'
    for manifest in manifests:
        root=ET.parse(manifest).getroot()
        assert not root.findall('uses-permission'),'Unexpected Android permissions'
        app=root.find('application')
        assert app.get(ns+'allowBackup')=='false'
        assert app.get(ns+'usesCleartextTraffic')=='false'
        assert app.get(ns+'debuggable','false')=='false'
    config=ROOT/'web/android/app/src/main/assets/capacitor.config.json'
elif sys.argv[1]=='ios':
    app=ROOT/'artifacts/ios/Build/Products/Debug-iphonesimulator/App.app'
    privacy=plistlib.loads((app/'PrivacyInfo.xcprivacy').read_bytes())
    assert privacy['NSPrivacyTracking'] is False
    assert privacy['NSPrivacyCollectedDataTypes']==[]
    assert privacy['NSPrivacyAccessedAPITypes'][0]['NSPrivacyAccessedAPITypeReasons']==['CA92.1']
    info=plistlib.loads((app/'Info.plist').read_bytes())
    assert info['NSAppTransportSecurity']['NSAllowsArbitraryLoads'] is False
    config=app/'capacitor.config.json'
else:
    raise SystemExit('Expected android or ios')
value=json.loads(config.read_text())
assert value['loggingBehavior']=='none'
assert 'url' not in value['server']
assert not value.get('server',{}).get('allowNavigation')
assert not value['android']['webContentsDebuggingEnabled']
print('PASS compiled mobile privacy, permission and offline configuration checks')
