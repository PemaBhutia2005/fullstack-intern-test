export interface Weather {
	location: {
		name: string;
		country: string;
		localtime: string;
	};
	current: {
		temp_c: number;
		temp_f: number;
		feelslike_c: number;
		feelslike_f: number;
		condition: { text: string; icon: string };
		humidity: number;
		wind_kph: number;
		wind_dir: string;
		vis_km: number;
		pressure_mb: number;
	};
}
