fprintf('verifying partitions of fold %i/%i ...\n',i,kfold)
for j=1:nc   % search for empty classes in train/validation/test sets
    if 0==sum(cl(ti)==j)
        fprintf('class %i has 0 training patterns\n',j)
    end
    if 0==sum(cl(vi)==j)
        fprintf('class %i has 0 validation patterns\n',j)
    end
    if 0==sum(cl(si)==j)
        fprintf('class %i has 0 test patterns\n',j)
    end
end
% search for repeated train/validation/test patterns
for j=1:ntp(i) %#ok<*IJCL>
    for k=1:nvp(i)
        if ti(j)==vi(k)
            fprintf('training pattern %i matches validation pattern %i\n',ti(j),vi(k));
        end
    end
    for k=1:nsp(i)
        if ti(j)==si(k)
            fprintf('training pattern %i matches test pattern %i\n',ti(j),si(k));
        end
    end
end
for j=1:nvp(i)
    for k=1:nsp(i)
        if vi(j)==si(k)
            fprintf('validation pattern %i matches test pattern %i\n',vi(j),si(k));
        end
    end
end
