import Head from "next/head";
import Navbar from "./Navbar";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	return (
		<>
			<Head>
				<title>Sweepstake</title>
				<meta name="Sweepstake" content="My lottery application" />
			</Head>
			<Navbar />
			<main className="flex-grow">{children}</main>
		</>
	);
};

export default Layout;
