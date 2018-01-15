{{/* vim: set filetype=mustache: */}}

{{/* Chart Name */}}
{{- define "footpatrol.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Fully-Qualified Chart Name */}}
{{- define "footpatrol.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}