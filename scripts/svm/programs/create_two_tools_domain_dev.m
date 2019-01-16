clear all
clc

RandStream.setGlobalStream(RandStream('mcg16807','Seed',0))  % inicializa o xerador de números aleatorios  

dataset='two_tools_domain_dev';ni=16;nc=2;
input_name={'RFC','WMC','DIT','NOC','DIP','LCOM','NOA','NOT','NOTa','NOTc','NOTe','LOC','NCLOC','CLOC','EXEC','DC'};

fprintf('reading %s files ...\n',dataset)

nf='original/SoftwareDevelopment.csv';np_dev=5238;[x_dev cl_dev]=read_csv(nf,np_dev,ni);
% nf='original/DiagramGeneratorDataVisualizationSoftware.csv';np_vis=1165;[x_vis cl_vis]=read_csv(nf,np_vis,ni);
% nf='original/ClientServerSoftware.csv';np_cli=1138;[x_cli cl_cli]=read_csv(nf,np_cli,ni);
% nf='original/ApplicationSoftware.csv';np_app=5046;[x_app cl_app]=read_csv(nf,np_app,ni);

train_perc=60;valid_perc=20;
ntp=floor(train_perc*np_dev/100);nvp=floor(valid_perc*np_dev/100);
nsp=np_dev-ntp-nvp;

% writing dataset information to file dataset/dataset.txt
fprintf('writing %s.txt ...\n',dataset)
nf=sprintf('%s.txt',dataset);
f=open_file(nf, 'w');
fprintf(f,'np_dev= %i\n',np_dev);  % pattern number
fprintf(f,'ni= %i\n',ni);  % input number
fprintf(f,'nc= %i\n',nc);  % class number
fprintf(f,'ntp= %i\n',ntp);  % number of training patterns
fprintf(f,'nvp= %i\n',nvp);  % number of validation patterns
fprintf(f,'nsp= %i\n',nsp);  % number of test patterns
fclose(f);

% writes whole dataset in weka arff format
fprintf('writing %s.arff ...\n',dataset)
x=x_dev;cl=cl_dev;
write_arff(dataset,x,cl,input_name);

% creating partitions
fprintf('creating partitions ...\n')
ic_dev=cell(1,nc);npc_dev=zeros(1,nc);npct_dev=zeros(1,nc);npcv_dev=zeros(1,nc);npcs_dev=zeros(1,nc);
for i=1:nc
	ic_dev{i}=find(cl_dev==i);npc_dev(i)=length(ic_dev{i});
	npct_dev(i)=ceil(train_perc*npc_dev(i)/100);
    npcv_dev(i)=ceil(valid_perc*npc_dev(i)/100);
    npcs_dev(i)=npc_dev(i)-npct_dev(i)-npcv_dev(i);
%  	fprintf('class %i: np_dev= %i ntp= %i nvp= %i nsp=%i\n',i,npc_dev(i),npct_dev(i),npcv_dev(i),npcs_dev(i));
end
% ntp_dev=no. training patterns (dev);nvp_dev=no. validation patterns (dev)
%  nsp_dev=no. test patterns (dev)
ntp_dev=sum(npct_dev);nvp_dev=sum(npcv_dev);nsp_dev=sum(npcs_dev);
% accounting number of training, validation and test patterns per class
ntrials=5;npcf_dev=zeros(nc,ntrials);k1=ntrials-1;
for i=1:nc
	t=ceil(npc_dev(i)/ntrials);npcf_dev(i,1:k1)=t;npcf_dev(i,ntrials)=npc_dev(i)-k1*t;
%  	fprintf('dev: class %i: npcf=',i);fprintf('%i ',npcf_dev(i,:));fprintf('sum %i\n',sum(npcf_dev(i,:)));
end
nf=sprintf('partitions_%s.dat',dataset);f=open_file(nf,'w');
j=zeros(1,nc);ind=zeros(1,np_dev);
for trial=1:ntrials
    fprintf('%i ',trial);ind(:)=0;p=1;j(:)=0;
    for i=1:nc  % shuffling
        n=npc_dev(i);j=randperm(n);
        for k=1:n
            l=j(k);u=ic_dev{i}(l);ic_dev{i}(l)=ic_dev{i}(k);ic_dev{i}(k)=u;
        end
    end
	f1=trial-1;
	for i=1:nc
		j(i)=min(npc_dev(i),1+f1*npcf_dev(i));
		for m=1:npct_dev(i)
			k=j(i);
            ind(p)=ic_dev{i}(k);p=p+1;
            j(i)=j(i)+1;
			if j(i)>npc_dev(i)
				j(i)=1;
			end
		end
	end
	for i=1:nc
		for m=1:npcv_dev(i)
			k=j(i);
            ind(p)=ic_dev{i}(k);p=p+1;
            j(i)=j(i)+1;
			if j(i)>npc_dev(i)
				j(i)=1;
			end
		end
	end
    for i=1:nc
        for m=1:npcs_dev(i)
            k=j(i);
            ind(p)=ic_dev{i}(k);p=p+1;
            j(i)=j(i)+1;
            if j(i)>npc_dev(i)
                j(i)=1;
            end
        end
    end
    ti=ind(1:ntp_dev);vi=ind(ntp_dev+1:ntp_dev+nvp_dev);si=ind(ntp_dev+nvp_dev+1:np_dev);
    verify_partition
    fprintf(f,'%i ',ti);fprintf(f,'%i ',vi);fprintf(f,'%i ',si);fprintf(f,'\n');
end
fprintf('\nfinished creation of dataset %s\n',dataset)