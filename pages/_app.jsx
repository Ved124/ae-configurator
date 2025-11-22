import '../styles/globals.css';
import { ConfigProvider } from '../src/ConfigContext';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastProvider } from '../components/ui/Toast';

export default function App({ Component, pageProps }) {
	return (
			<ToastProvider>
				<ConfigProvider>
					<Component {...pageProps} />
				</ConfigProvider>
			</ToastProvider>
	);
}