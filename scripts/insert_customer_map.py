from pathlib import Path
p = Path('/home/ubuntu/mealora-foods/client/src/pages/Profile.tsx')
s = p.read_text()
old = '<div className="mini-map"><MapPin size={22} /><span>Your live map activates when a courier is on the way.</span></div>'
new = '{activeOrder ? <LiveTrackingMap tracking={tracking.data} address={activeOrder.deliveryAddress} /> : <div className="mini-map"><MapPin size={22} /><span>Your live map activates when a courier is on the way.</span></div>}'
if old not in s:
    raise SystemExit('target not found')
p.write_text(s.replace(old, new, 1))
