"""Generate pinned Capacitor projects, then apply required offline/security overlays.
Generated projects are disposable; change this script/config rather than generated files.
"""
import argparse
import json
import plistlib
import re
import struct
import subprocess
from pathlib import Path
from generate_app_icons import icon
ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT/'web'
VERSION = '0.4.0'
BUILD = 2

def run(*args):
    subprocess.run(args, cwd=WEB, check=True)

def android():
    root = WEB/'android'
    manifest = root/'app/src/main/AndroidManifest.xml'
    text = manifest.read_text().replace('android:allowBackup="true"', 'android:allowBackup="false" android:usesCleartextTraffic="false" android:dataExtractionRules="@xml/data_extraction_rules" android:fullBackupContent="@xml/backup_rules"')
    # No network permission in the first, fully bundled Android edition. External
    # references use the user's separate browser. No credentials or server sync.
    text = re.sub(r'\s*<uses-permission android:name="android.permission.INTERNET"\s*/>', '', text)
    manifest.write_text(text)
    xml = root/'app/src/main/res/xml'
    exclusions = ''.join(f'<exclude domain="{domain}" path="."/>' for domain in ('root','file','database','sharedpref','external'))
    (xml/'backup_rules.xml').write_text('<?xml version="1.0" encoding="utf-8"?><full-backup-content>'+exclusions+'</full-backup-content>')
    (xml/'data_extraction_rules.xml').write_text('<?xml version="1.0" encoding="utf-8"?><data-extraction-rules><cloud-backup>'+exclusions+'</cloud-backup><device-transfer>'+exclusions+'</device-transfer></data-extraction-rules>')
    gradle=root/'app/build.gradle'
    text=re.sub(r'versionCode \d+', f'versionCode {BUILD}',gradle.read_text())
    gradle.write_text(re.sub(r'versionName "[^"]+"',f'versionName "{VERSION}"',text))
    for png in (root/'app/src/main/res').rglob('*.png'):
        if png.name in ('ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png','splash.png'):
            width,height=struct.unpack('!II',png.read_bytes()[16:24]);png.write_bytes(icon(width,height))
    # Verify the overlay instead of silently proceeding when a template changes.
    assert 'android:allowBackup="false"' in manifest.read_text()
    assert 'uses-permission' not in manifest.read_text()

def ios():
    root=WEB/'ios/App'
    info=root/'App/Info.plist'
    data=plistlib.loads(info.read_bytes())
    data['NSAppTransportSecurity']={'NSAllowsArbitraryLoads':False,'NSAllowsArbitraryLoadsInWebContent':False}
    info.write_bytes(plistlib.dumps(data))
    privacy={'NSPrivacyTracking':False,'NSPrivacyTrackingDomains':[], 'NSPrivacyCollectedDataTypes':[], 'NSPrivacyAccessedAPITypes':[{'NSPrivacyAccessedAPIType':'NSPrivacyAccessedAPICategoryUserDefaults','NSPrivacyAccessedAPITypeReasons':['CA92.1']}]}
    (root/'App/PrivacyInfo.xcprivacy').write_bytes(plistlib.dumps(privacy))
    project=root/'App.xcodeproj/project.pbxproj'
    text=project.read_text()
    if 'PrivacyInfo.xcprivacy' not in text:
        text=text.replace('/* End PBXBuildFile section */','SML000000000000000000001 /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = SML000000000000000000002; };\n/* End PBXBuildFile section */')
        text=text.replace('/* End PBXFileReference section */','SML000000000000000000002 /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };\n/* End PBXFileReference section */')
        text=text.replace('504EC3131FED79650016851F /* Info.plist */,','504EC3131FED79650016851F /* Info.plist */,\nSML000000000000000000002 /* PrivacyInfo.xcprivacy */,')
        text=text.replace('504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,','504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,\nSML000000000000000000001 /* PrivacyInfo.xcprivacy in Resources */,')
    text=text.replace('SML000000000000000000001','A11000000000000000000001').replace('SML000000000000000000002','A11000000000000000000002')
    text=re.sub(r'MARKETING_VERSION = [^;]+;',f'MARKETING_VERSION = {VERSION};',text)
    text=re.sub(r'CURRENT_PROJECT_VERSION = \d+;',f'CURRENT_PROJECT_VERSION = {BUILD};',text)
    project.write_text(text)
    assets=root/'App/Assets.xcassets'
    for png in assets.rglob('*.png'):
        width,height=struct.unpack('!II',png.read_bytes()[16:24]);png.write_bytes(icon(width,height))
    assert 'PrivacyInfo.xcprivacy in Resources */,' in text

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('platform', choices=['android','ios','all'])
    args=parser.parse_args()
    run('npm','run','build')
    for platform in (['android','ios'] if args.platform=='all' else [args.platform]):
        if not (WEB/platform).exists():run('npx','--no-install','cap','add',platform)
        run('npx','--no-install','cap','sync',platform)
        globals()[platform]()
        # Legacy website and service worker are deliberately not native features.
        public=WEB/'android/app/src/main/assets/public' if platform=='android' else WEB/'ios/App/App/public'
        import shutil
        shutil.rmtree(public/'legacy',ignore_errors=True)
        for name in ('sw.js','offline-build.json','_headers'):(public/name).unlink(missing_ok=True)
        print(f'{platform}: offline project prepared; signing and device validation still required')
