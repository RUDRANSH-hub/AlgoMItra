import pandas as pd

# Load the two CSV files into DataFrames
csv_file1 = 'NSE_.csv'  # Path to your first CSV file
csv_file2 = 'NSE1.csv'  # Path to your second CSV file

# Read both CSV files
df1 = pd.read_csv(csv_file1)
df2 = pd.read_csv(csv_file2)

# Merge the two DataFrames based on the 'symbol' column
merged_df = pd.merge(df1, df2, on='Symbol', how='inner')

# Save the merged DataFrame into a new CSV file
output_csv = 'merged_output.csv'
merged_df.to_csv(output_csv, index=False)

print(f'Merged CSV saved as {output_csv}')
