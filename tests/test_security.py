import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class SecurityTests(unittest.TestCase):
    def test_restrictive_csp(self):
        headers = (ROOT / "_headers").read_text()
        for item in ("default-src 'none'", "script-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'none'"):
            self.assertIn(item, headers)
        self.assertNotIn("'unsafe-inline'", headers)
        self.assertNotIn("'unsafe-eval'", headers)

    def test_dom_text_only(self):
        script = (ROOT / "app.js").read_text()
        self.assertNotIn(".innerHTML", script)
        self.assertNotIn("eval(", script)
        self.assertNotIn("new Function(", script)

    def test_no_external_code(self):
        html = (ROOT / "index.html").read_text()
        self.assertNotIn("<script src=\"https://", html)
        self.assertNotIn("onerror=", html)
        self.assertNotIn("onclick=", html)

if __name__ == "__main__":
    unittest.main()
