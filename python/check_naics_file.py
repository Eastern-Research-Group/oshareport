import pandas as pd
from json import dumps, load


path = r'C:\Users\erguser\OneDrive - Eastern Research Group\Other Projects\OSHA\Applicability Tool\\'
filename = 'NAICS 2012-2022 new requirements.xlsx'
filepath = path + filename

output_path = '../data/naics2.json'


def load_file():
	df = pd.read_excel(filepath)
	df.drop(['ID', '4-digit NAICS', 'NAICS 2012', 'NAICS 2017', 'NAICS 2022'], axis=1, inplace=True)
	col_names = {'NAICS Code': 'NAICSCode',
	             'NAICS Title': 'NAICSTitle',
	             'Not OSHA Jurisdiction': 'NotOSHAJurisdiction',
	             'RK Exempt': 'RKExempt',
	             '20+ employees must report': 'Employees20',
	             'Only 250+ employees must report': 'Employees250',
	             '300/301 data': 'Form300_301'}
	df.rename(columns=col_names, inplace=True)
	return df


def show_errors(df, message):
	print(message)
	print(df)
	print('---------------------------------------------------------------------------------')	


def find_invalid_values(df, column):
	error_df = df[(df[column] != True) & (df[column] != False)]
	if not error_df.empty:
		msg = f'Invalid value(s) in {column}'
		show_errors(error_df[['NAICSCode', column]], msg)
		return True
	return False


def validate():
	df = load_file()

	pd.set_option('display.max_columns', None)
	pd.set_option('display.max_rows', None)

	errors = False
	for column in ['NotOSHAJurisdiction', 'RKExempt', 'Employees20', 'Employees250']:
		err = find_invalid_values(df, column)
		if err:
			errors = True

	employees_errors = df[(df.Employees20 == True) & (df.Employees250 == True)]
	if not employees_errors.empty:
		msg = 'The following rows have True for both Employees20 and Employees250; only one can be True.'
		show_errors(employees_errors[['NAICSCode', 'Employees20', 'Employees250']], msg)
		errors = True

	return df, errors


def convert_cols(df):
	i = 0
	for dtype in df.dtypes:
		if dtype == 'bool':
			df.iloc[:,i] = df.iloc[:,i].astype('str').str.upper()
		i += 1
	df = df.astype('str')
	return df


def convert_to_json(df):
	df_json = df.to_dict(orient='records')
	json_dict = {}
	json_dict['NAICS'] = df_json
	json = dumps(json_dict, indent=4) 

	with open(output_path, 'w') as f:
		f.write(json)


def compare(old_file, new_file):
	with open(old_file) as old_f:
		old_json = load(old_f)
	with open(new_file) as new_f:
		new_json = load(new_f)
	old = old_json['NAICS']
	new = new_json['NAICS']
	print(f'Number of elements in old JSON: {len(old)}')
	print(f'Number of elements in new JSON: {len(new)}')
	print('--------------------------------------------------------------------------------')

	old_codes = [e['NAICSCode'] for e in old]
	new_codes = [e['NAICSCode'] for e in new]

	added_codes = list(set(new_codes) - set(old_codes))
	if added_codes:
		print(f'The following codes are in the new NAICS file but not the old: {added_codes}')
		
	missing_codes = list(set(old_codes) - set(new_codes))
	if missing_codes:
		print(f'The following codes are in the old NAICS file but not the new: {missing_codes}')

	if not added_codes and not missing_codes:
		print('The codes in the two files are the same.')
		print('--------------------------------------------------------------------------------')

	keys = list(new[0].keys())
	keys.remove('NAICSCode')
	for new_e in new:
		old_e = next((item for item in old if item['NAICSCode'] == new_e['NAICSCode']), None)
		for key in keys:
			if new_e[key] != old_e[key]:
				print(new_e['NAICSCode'] + ': ' + key)
				print('old value: ' + old_e[key])
				print('new value: ' + new_e[key])
				print('--------------------------------------------------------------------------------')


def main():
	df, errors = validate()
	if errors:
		print('Please fix above errors. Aborting...')
		exit()	

	df = convert_cols(df)	
	convert_to_json(df)	



if __name__ == '__main__':   
	main()
	compare('../data/naics2.json', output_path)