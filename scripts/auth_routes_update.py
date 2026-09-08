from pathlib import Path

home = Path('/home/ubuntu/mealora-foods/client/src/pages/Home.tsx')
text = home.read_text()
text = text.replace('{isAuthenticated ? <button className="profile-chip"', '{isAuthenticated ? <button className="profile-chip"')
text = text.replace(': <button className="login-button" onClick={() => startLogin()}>Log in</button>', ': <a className="login-button" href="/auth">Log in</a>')
text = text.replace('<button onClick={() => startLogin()}>Log in to unlock orders</button>', '<a href="/auth">Log in to unlock orders <ArrowRight size={14} /></a>')
text = text.replace('<button onClick={() => { setMobileNavOpen(false); startLogin(); }}>Log in to Mealora <ArrowRight size={16} /></button>', '<a href="/auth" onClick={() => setMobileNavOpen(false)}>Log in to Mealora <ArrowRight size={16} /></a>')
home.write_text(text)

profile = Path('/home/ubuntu/mealora-foods/client/src/pages/Profile.tsx')
text = profile.read_text().replace('<button onClick={() => startLogin()}>Sign in to continue <ArrowRight size={16} /></button>', '<a href="/auth">Sign in to continue <ArrowRight size={16} /></a>')
profile.write_text(text)
