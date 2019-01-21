#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>

#include "svm.cpp"

extern void *allocate_vector(int, size_t, const char *);
extern float **allocate_float_matrix(int, int, const char *);
extern char **allocate_char_matrix(int, int, const char *);
extern void deallocate_vector(void *, int, size_t, const char *);
extern void deallocate_float_matrix(float **, int, int, const char *);
extern void deallocate_char_matrix(char **, int, int, const char *);
extern void list_pointers();

extern int sint;

float **x;
int br;
int nc;
int ni;
int np;
int *d;
char dataset[100];
char basedir[100];
struct svm_model *svm;

FILE *open_file(char *file, const char *perm)
{
	FILE *f = fopen(file, perm);
	if (!f)
	{
		fprintf(stderr, "open_file: error fopen %s: %s\n", file, strerror(errno));
		exit(1);
	}
	return (f);
}

void read_dataset_info()
{
	FILE *pf;
	char fich[200], s[100];

	sprintf(fich, "%s/data/%s/%s.txt", basedir, dataset, dataset);
	pf = open_file(fich, "r");
	fscanf(pf, "%s %i", s, &np);
	fscanf(pf, "%s %i", s, &ni);
	fscanf(pf, "%s %i", s, &nc);
	fclose(pf);
}

/* void read_data()
{
	FILE *pf;
	int i, j, k, t;
	char cad[100], f_data[100];
	sprintf(f_data, "%s/data/%s/%s.dat", basedir, dataset, dataset);
	x = allocate_float_matrix(np, ni, "x");
	d = (int *)allocate_vector(np, sint, "d");
	pf = open_file(f_data, "r");
	for (i = 0; i < ni; i++)
		fscanf(pf, "%s", cad);
	fscanf(pf, "%s\n", cad);
	for (i = 0; i < np; i++)
	{
		fscanf(pf, "%i ", &k);
		for (j = 0; j < ni; j++)
			fscanf(pf, "%g ", &x[i][j]);
		fscanf(pf, "%i\n", &t);
		d[i] = t - 1;
	}
	fclose(pf);
}
*/

int main(int argc, char *argv[])
{
	int i, k;
	char nf[100];
	struct svm_node *t;
	if (argc < 2)
	{
		printf("Faltan argumentos");
		return (0);
	}
	strcpy(basedir, "../..");
	strcpy(dataset, argv[1]);
	read_dataset_info();
	if (argc < (2+ni))
	{
		printf("Faltan argumentos");
		return (0);
	}
	//read_data();
	float *entrada = (float *) malloc((1 + ni) * sizeof(float));
	for(i=0; i<ni; i++){
		entrada[i] = atof(argv[i+2]);
	}
	t = (struct svm_node *)calloc(1 + ni, sizeof(struct svm_node));
	if (!t)
	{
		perror("calloc svm_node");
		exit(1);
	}
	sprintf(nf, "%s/results/%s/svm_%s.dat", basedir, dataset, dataset);
	open_file(nf, "r");
	svm = svm_load_model(nf);
	// for(i=0;i<np;i++) {
	// 	for(j=0;j<ni;j++) {
	// 		t[j].index=j;t[j].value=x[i][j];
	// 	}
	// 	t[ni].index=-1;
	// 	k=svm_predict(svm,t);
	// 	printf("predicted= %i true= %i\n",k,d[i]);
	// }
	for (i = 0; i < ni; i++)
	{
		t[i].index = i;
		t[i].value = entrada[i];
	}
	t[ni].index=-1;
	k = svm_predict(svm, t);
	printf("%i", k);
	// deallocate_float_matrix(x, np, ni, "x");
	//deallocate_vector(d, np, sint, "d");
	free(t);
	return (0);
}
